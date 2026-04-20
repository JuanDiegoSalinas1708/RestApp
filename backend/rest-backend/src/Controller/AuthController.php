<?php

namespace App\Controller;

use App\Entity\Usuarios;
use App\Repository\UsuariosRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/auth', name: 'api_auth_')]
class AuthController extends AbstractController
{
    // ============ REGISTRO ============
    
    #[Route('/registro', name: 'registro', methods: ['POST'])]
    public function registro(Request $request, EntityManagerInterface $em, UsuariosRepository $usuariosRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data) || empty($data['correo']) || empty($data['password']) || empty($data['nombre']) || empty($data['apellido']) || !isset($data['edad'])) {
            return $this->json(['status' => 'error', 'message' => 'Datos incompletos.'], 400);
        }

        $password = trim($data['password']);
        if (strlen($password) < 8 || !preg_match('/[A-Z]/', $password) || !preg_match('/[a-z]/', $password) || !preg_match('/[0-9]/', $password)) {
            return $this->json(['status' => 'error', 'message' => 'Contraseña débil. Debe tener 8+ caracteres, mayúscula, minúscula y número.'], 400);
        }

        if ((int)$data['edad'] < 18) {
            return $this->json(['status' => 'error', 'message' => 'Debes ser mayor de 18 años.'], 400);
        }

        $correo = trim($data['correo']);
        if ($usuariosRepository->findOneBy(['correo' => $correo])) {
            return $this->json(['status' => 'error', 'message' => 'Ya existe una cuenta con ese correo.'], 400);
        }

        $usuario = new Usuarios();
        $usuario->setNombre(trim($data['nombre']));
        $usuario->setApellido(trim($data['apellido']));
        $usuario->setCorreo($correo);
        $usuario->setPassword(password_hash($password, PASSWORD_BCRYPT));
        $usuario->setEdad((int) $data['edad']);
        $usuario->setEstado(true);
        $usuario->setIntentosFallidos(0);
        $usuario->setBloqueadoHasta(null);
        $usuario->setEmailVerificado(true);

        $em->persist($usuario);
        $em->flush();

        return $this->json(['status' => 'ok', 'message' => 'Usuario registrado correctamente.']);
    }

    // ============ LOGIN (SIN FECHAS) ============
    
    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(Request $request, UsuariosRepository $usuariosRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (empty($data['correo']) || empty($data['password'])) {
            return $this->json(['status' => 'error', 'message' => 'Correo y contraseña son obligatorios.'], 400);
        }

        $usuario = $usuariosRepository->findOneBy(['correo' => trim($data['correo'])]);

        if (!$usuario) {
            return $this->json(['status' => 'error', 'message' => 'Credenciales inválidas.'], 401);
        }

        if (!password_verify(trim($data['password']), $usuario->getPassword())) {
            return $this->json(['status' => 'error', 'message' => 'Credenciales inválidas.'], 401);
        }

        return $this->json([
            'status' => 'ok',
            'usuario' => [
                'id' => $usuario->getId(),
                'nombre' => $usuario->getNombre(),
                'apellido' => $usuario->getApellido(),
                'correo' => $usuario->getCorreo(),
                'edad' => $usuario->getEdad(),
                'estado' => $usuario->getEstado(),
            ]
        ]);
    }
}