<?php

namespace App\Controller;

use App\Entity\Usuarios;
use App\Repository\UsuariosRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

final class UsuariosController extends AbstractController
{
    #[Route('/api/usuarios', methods: ['GET'])]
    public function usuarios(UsuariosRepository $usuariosRepository): JsonResponse
    {
        $usuarios = array_map(static function ($usuario) {
            return [
                'Id_Usuario' => $usuario->getId(),
                'Nombre'     => $usuario->getNombre(),
                'Apellido'   => $usuario->getApellido(),
                'Correo'     => $usuario->getCorreo(),
                'Edad'       => $usuario->getEdad(),
                'Estado'     => $usuario->getEstado(),
            ];
        }, $usuariosRepository->findAll());

        return $this->json(['status' => 'ok', 'data' => $usuarios]);
    }

    #[Route('/api/usuarios/todos', methods: ['GET'])]
    public function todosUsuarios(UsuariosRepository $usuariosRepository): JsonResponse
    {
        $usuarios = array_map(static function ($usuario) {
            return [
                'Id_Usuario' => $usuario->getId(),
                'Nombre'     => $usuario->getNombre(),
                'Apellido'   => $usuario->getApellido(),
                'Correo'     => $usuario->getCorreo(),
                'Edad'       => $usuario->getEdad(),
                'Estado'     => $usuario->getEstado(),
            ];
        }, $usuariosRepository->findAll());

        return $this->json(['status' => 'ok', 'data' => $usuarios]);
    }

    #[Route('/api/usuarios/{id}', methods: ['GET'])]
    public function getUsuario(int $id, UsuariosRepository $usuariosRepository): JsonResponse
    {
        $usuario = $usuariosRepository->find($id);
        if (!$usuario) {
            return $this->json(['status' => 'error', 'message' => 'Usuario no encontrado.'], 404);
        }

        return $this->json([
            'status' => 'ok',
            'data'   => [
                'Id_Usuario' => $usuario->getId(),
                'Nombre'     => $usuario->getNombre(),
                'Apellido'   => $usuario->getApellido(),
                'Correo'     => $usuario->getCorreo(),
                'Edad'       => $usuario->getEdad(),
                'Estado'     => $usuario->getEstado(),
            ]
        ]);
    }

    #[Route('/api/usuarios', methods: ['POST'])]
    public function crearUsuario(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data) || empty($data['Nombre']) || empty($data['Apellido']) || empty($data['Correo']) || empty($data['Password']) || !isset($data['Edad'])) {
            return $this->json(['status' => 'error', 'message' => 'Datos incompletos.'], 400);
        }

        $usuario = new Usuarios();
        $usuario->setNombre($data['Nombre']);
        $usuario->setApellido($data['Apellido']);
        $usuario->setCorreo($data['Correo']);
        $usuario->setPassword(password_hash(trim($data['Password']), PASSWORD_BCRYPT));
        $usuario->setEdad((int) $data['Edad']);
        $usuario->setEstado(true);

        $em->persist($usuario);
        $em->flush();

        return $this->json([
            'status'  => 'ok',
            'message' => 'Usuario creado correctamente.',
            'data'    => [
                'Id_Usuario' => $usuario->getId(),
                'Nombre'     => $usuario->getNombre(),
                'Apellido'   => $usuario->getApellido(),
                'Correo'     => $usuario->getCorreo(),
                'Edad'       => $usuario->getEdad(),
                'Estado'     => $usuario->getEstado(),
            ]
        ]);
    }

    #[Route('/api/usuarios/{id}', methods: ['PUT'])]
    public function editarUsuario(int $id, Request $request, EntityManagerInterface $em, UsuariosRepository $usuariosRepository): JsonResponse
    {
        $usuario = $usuariosRepository->find($id);
        if (!$usuario) {
            return $this->json(['status' => 'error', 'message' => 'Usuario no encontrado.'], 404);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['status' => 'error', 'message' => 'Datos inválidos.'], 400);
        }

        if (isset($data['Nombre']))    $usuario->setNombre($data['Nombre']);
        if (isset($data['Apellido']))  $usuario->setApellido($data['Apellido']);
        if (isset($data['Correo']))    $usuario->setCorreo($data['Correo']);
        if (isset($data['Password']) && !empty($data['Password'])) $usuario->setPassword(password_hash(trim($data['Password']), PASSWORD_BCRYPT));
        if (isset($data['Edad']))      $usuario->setEdad((int) $data['Edad']);
        if (isset($data['Estado']))    $usuario->setEstado((bool) $data['Estado']);

        $em->flush();

        return $this->json([
            'status'  => 'ok',
            'message' => 'Usuario actualizado correctamente.',
            'data'    => [
                'Id_Usuario' => $usuario->getId(),
                'Nombre'     => $usuario->getNombre(),
                'Apellido'   => $usuario->getApellido(),
                'Correo'     => $usuario->getCorreo(),
                'Edad'       => $usuario->getEdad(),
                'Estado'     => $usuario->getEstado(),
            ]
        ]);
    }

    #[Route('/api/usuarios/{id}', methods: ['DELETE'])]
    public function eliminarUsuario(int $id, EntityManagerInterface $em, UsuariosRepository $usuariosRepository): JsonResponse
    {
        $usuario = $usuariosRepository->find($id);
        if (!$usuario) {
            return $this->json(['status' => 'error', 'message' => 'Usuario no encontrado.'], 404);
        }

        $em->remove($usuario);
        $em->flush();

        return $this->json(['status' => 'ok', 'message' => 'Usuario eliminado correctamente.']);
    }
}