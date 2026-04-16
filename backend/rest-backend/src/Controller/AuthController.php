<?php

namespace App\Controller;

use App\Entity\Usuarios;
use App\Repository\UsuariosRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

#[Route('/api/auth', name: 'api_auth_')]
class AuthController extends AbstractController
{
    public function __construct(
        private MailerInterface $mailer
    ) {}

    // ============ REGISTRO ============
    
    #[Route('/registro', name: 'registro', methods: ['POST'])]
    public function registro(Request $request, EntityManagerInterface $em, UsuariosRepository $usuariosRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Validar campos obligatorios
        if (!is_array($data) || empty($data['correo']) || empty($data['password']) || empty($data['nombre']) || empty($data['apellido']) || !isset($data['edad'])) {
            return $this->json([
                'status' => 'error',
                'message' => 'Datos incompletos para el registro.'
            ], 400);
        }

        // Validar contraseña segura
        $password = trim($data['password']);
        if (strlen($password) < 8) {
            return $this->json(['status' => 'error', 'message' => 'La contraseña debe tener al menos 8 caracteres.'], 400);
        }
        if (!preg_match('/[A-Z]/', $password)) {
            return $this->json(['status' => 'error', 'message' => 'La contraseña debe tener al menos una letra mayúscula.'], 400);
        }
        if (!preg_match('/[a-z]/', $password)) {
            return $this->json(['status' => 'error', 'message' => 'La contraseña debe tener al menos una letra minúscula.'], 400);
        }
        if (!preg_match('/[0-9]/', $password)) {
            return $this->json(['status' => 'error', 'message' => 'La contraseña debe tener al menos un número.'], 400);
        }
        if (!preg_match('/[!@#$%^&*(),.?":{}|<>]/', $password)) {
            return $this->json(['status' => 'error', 'message' => 'La contraseña debe tener al menos un carácter especial.'], 400);
        }

        // Validar edad
        if ((int)$data['edad'] < 18) {
            return $this->json(['status' => 'error', 'message' => 'Debes ser mayor de 18 años para registrarte.'], 400);
        }

        // Validar correo único
        $correo = trim($data['correo']);
        $existingUser = $usuariosRepository->findOneBy(['correo' => $correo]);
        if ($existingUser !== null) {
            return $this->json([
                'status' => 'error',
                'message' => 'Ya existe una cuenta con ese correo.'
            ], 400);
        }

        // Crear usuario
        $usuario = new Usuarios();
        $usuario->setNombre(trim($data['nombre']));
        $usuario->setApellido(trim($data['apellido']));
        $usuario->setCorreo($correo);
        $usuario->setPassword(password_hash($password, PASSWORD_BCRYPT));
        $usuario->setEdad((int) $data['edad']);
        $usuario->setEstado(true);
        $usuario->setIntentosFallidos(0);
        $usuario->setBloqueadoHasta(null);
        
        $tokenVerificacion = bin2hex(random_bytes(32));
        $usuario->setTokenVerificacion($tokenVerificacion);
        $usuario->setEmailVerificado(false);
    
        $em->persist($usuario);
        $em->flush();

        $verificationLink = "http://localhost:4200/verificar/$tokenVerificacion";
        $fromAddress = $_ENV['MAILER_FROM'] ?? $_SERVER['MAILER_FROM'] ?? 'onboarding@resend.dev';
        $email = (new Email())
            ->from($fromAddress)
            ->to($usuario->getCorreo())
            ->subject('Verifica tu cuenta - AppRest')
            ->html("<p>Hola {$usuario->getNombre()},</p><p>Por favor verifica tu correo haciendo clic en el siguiente enlace:</p><p><a href='$verificationLink'>$verificationLink</a></p>");

        $errorMessage = null;
        try {
            $this->mailer->send($email);
        } catch (\Throwable $e) {
            $errorMessage = $e->getMessage();
            error_log('Error al enviar correo de verificación: ' . $errorMessage);
        }

        if ($errorMessage !== null) {
            return $this->json([
                'status' => 'error',
                'message' => 'No se pudo enviar el correo de verificación. Revisa la configuración de Resend.',
                'debug' => $errorMessage
            ], 500);
        }

        return $this->json([
            'status' => 'ok',
            'message' => 'Usuario registrado correctamente. Revisa tu correo para verificar la cuenta.'
        ]);
    }

    // ============ LOGIN ============
    
    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(Request $request, UsuariosRepository $usuariosRepository, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data) || empty($data['correo']) || empty($data['password'])) {
            return $this->json([
                'status' => 'error',
                'message' => 'Correo y contraseña son obligatorios.'
            ], 400);
        }

        $usuario = $usuariosRepository->findOneBy(['correo' => trim($data['correo'])]);

        if (!$usuario) {
            return $this->json([
                'status' => 'error',
                'message' => 'Credenciales inválidas.'
            ], 401);
        }

        $ahora = new \DateTime();
        if ($usuario->getBloqueadoHasta() && $usuario->getBloqueadoHasta() > $ahora) {
            $restante = $usuario->getBloqueadoHasta()->getTimestamp() - $ahora->getTimestamp();
            return $this->json([
                'status' => 'error',
                'message' => 'Cuenta bloqueada. Intenta de nuevo en ' . ceil($restante) . ' segundos.'
            ], 401);
        }

        if (!password_verify(trim($data['password']), $usuario->getPassword())) {
            $intentos = $usuario->getIntentosFallidos() + 1;
            $usuario->setIntentosFallidos($intentos);

            if (!$usuario->isEmailVerificado()) {
                $em->flush();
                return $this->json([
                    'status' => 'error',
                    'message' => 'Por favor verifica tu correo antes de intentar iniciar sesión.'
                ], 401);
            }
            
            if ($intentos >= 3) {
                $usuario->setBloqueadoHasta((new \DateTime())->modify('+30 seconds'));
                $usuario->setIntentosFallidos(0);
                $em->flush();
                return $this->json([
                    'status' => 'error',
                    'message' => 'Demasiados intentos fallidos. Cuenta bloqueada por 30 segundos.'
                ], 401);
            }
            
            $em->flush();
            return $this->json([
                'status' => 'error',
                'message' => 'Credenciales inválidas. Te quedan ' . (3 - $intentos) . ' intentos.'
            ], 401);
        }

        $usuario->setIntentosFallidos(0);
        $usuario->setBloqueadoHasta(null);
        $em->flush();

        return $this->json([
            'status' => 'ok',
            'usuario' => [
                'id' => $usuario->getId(),
                'nombre' => $usuario->getNombre(),
                'apellido' => $usuario->getApellido(),
                'correo' => $usuario->getCorreo(),
                'edad' => $usuario->getEdad(),
                'estado' => $usuario->getEstado(),
            ],
        ]);
    }

    // ============ VERIFICAR CORREO ============
    
    #[Route('/verificar/{token}', name: 'verificar', methods: ['GET'])]
    public function verificarEmail(string $token, UsuariosRepository $usuariosRepository, EntityManagerInterface $em): JsonResponse
    {
        $usuario = $usuariosRepository->findOneBy(['tokenVerificacion' => $token]);
        
        if (!$usuario) {
            return $this->json([
                'status' => 'error',
                'message' => 'Token de verificación inválido.'
            ], 400);
        }

        if ($usuario->isEmailVerificado()) {
            return $this->json([
                'status' => 'warning',
                'message' => 'La cuenta ya estaba verificada'
            ]);
        }
        
        $usuario->setEmailVerificado(true);
        $usuario->setTokenVerificacion(null);
        $em->flush();
        
        return $this->json([
            'status' => 'ok',
            'message' => 'Email verificado correctamente. Ya puedes iniciar sesión.'
        ]);
    }

    // ============ RECUPERAR CONTRASEÑA (SIMPLE) ============
    
    #[Route('/recuperar', name: 'recuperar', methods: ['POST'])]
    public function recuperarPassword(Request $request, UsuariosRepository $usuariosRepository, EntityManagerInterface $em): JsonResponse
    {   
        $data = json_decode($request->getContent(), true);
        
        if (empty($data['correo']) || empty($data['password'])) {
            return $this->json([
                'status' => 'error',
                'message' => 'Correo y nueva contraseña son obligatorios.'
            ], 400);
        }
        
        $usuario = $usuariosRepository->findOneBy(['correo' => trim($data['correo'])]);
        
        if (!$usuario) {
            return $this->json([
                'status' => 'error',
                'message' => 'No existe una cuenta con ese correo.'
            ], 404);
        }
        
        $password = trim($data['password']);
        
        if (strlen($password) < 8) {
            return $this->json(['status' => 'error', 'message' => 'La contraseña debe tener al menos 8 caracteres.'], 400);
        }
        if (!preg_match('/[A-Z]/', $password)) {
            return $this->json(['status' => 'error', 'message' => 'La contraseña debe tener al menos una letra mayúscula.'], 400);
        }
        if (!preg_match('/[a-z]/', $password)) {
            return $this->json(['status' => 'error', 'message' => 'La contraseña debe tener al menos una letra minúscula.'], 400);
        }
        if (!preg_match('/[0-9]/', $password)) {
            return $this->json(['status' => 'error', 'message' => 'La contraseña debe tener al menos un número.'], 400);
        }
        
        // Actualizar contraseña directamente
        $usuario->setPassword(password_hash($password, PASSWORD_BCRYPT));
        $usuario->setIntentosFallidos(0);
        $usuario->setBloqueadoHasta(null);
        $usuario->setTokenRecuperacion(null);
        $usuario->setTokenRecuperacionExpiracion(null);
        $em->flush();
        
        return $this->json([
            'status' => 'ok',
            'message' => 'Contraseña actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.'
        ]);
    }
}