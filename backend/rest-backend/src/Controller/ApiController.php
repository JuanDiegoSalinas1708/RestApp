<?php

namespace App\Controller;

use App\Entity\Usuarios;
use App\Repository\ProductosRepository;
use App\Repository\UsuariosRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

final class ApiController extends AbstractController
{
    #[Route('/api/registro', methods: ['POST'])]
    public function registro(Request $request, EntityManagerInterface $em, UsuariosRepository $usuariosRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data) || empty($data['correo']) || empty($data['password']) || empty($data['nombre']) || empty($data['apellido']) || !isset($data['edad'])) {
            return $this->json([
                'status' => 'error',
                'message' => 'Datos incompletos para el registro.'
            ], 400);
        }

        $correo = trim($data['correo']);
        $existingUser = $usuariosRepository->findOneBy(['correo' => $correo]);

        if ($existingUser !== null) {
            return $this->json([
                'status' => 'error',
                'message' => 'Ya existe una cuenta con ese correo.'
            ], 400);
        }

        $usuario = new Usuarios();
        $usuario->setNombre(trim($data['nombre']));
        $usuario->setApellido(trim($data['apellido']));
        $usuario->setCorreo($correo);
        $usuario->setPassword(trim($data['password']));
        $usuario->setEdad((int) $data['edad']);
        $usuario->setEstado(true);

        $em->persist($usuario);
        $em->flush();

        return $this->json([
            'status' => 'ok',
            'message' => 'Usuario registrado correctamente.'
        ]);
    }

    #[Route('/api/login', methods: ['POST'])]
    public function login(Request $request, UsuariosRepository $usuariosRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data) || empty($data['correo']) || empty($data['password'])) {
            return $this->json([
                'status' => 'error',
                'message' => 'Correo y contraseña son obligatorios.'
            ], 400);
        }

        $usuario = $usuariosRepository->findOneBy([
            'correo' => trim($data['correo']),
            'password' => trim($data['password']),
            'estado' => true,
        ]);

        if ($usuario === null) {
            return $this->json([
                'status' => 'error',
                'message' => 'Credenciales invalidas o usuario inactivo.'
            ], 401);
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
            ],
        ]);
    }

    #[Route('/api/productos', methods: ['GET'])]
    public function productos(ProductosRepository $productosRepository): JsonResponse
    {
        $productos = array_map(static function ($producto) {
            return [
                'id' => $producto->getId(),
                'nombre' => $producto->getNombre(),
                'precio' => $producto->getPrecio(),
                'descripcion' => $producto->getDescripcion(),
            ];
        }, $productosRepository->findAll());

        return $this->json([
            'status' => 'ok',
            'data' => $productos,
        ]);
    }

    #[Route('/api/productos', methods: ['POST'])]
    public function crearProducto(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data) || empty($data['nombre']) || empty($data['precio']) || empty($data['descripcion'])) {
            return $this->json([
                'status' => 'error',
                'message' => 'Datos incompletos para crear el producto.'
            ], 400);
        }

        $producto = new \App\Entity\Productos();
        $producto->setNombre(trim($data['nombre']));
        $producto->setPrecio(trim($data['precio']));
        $producto->setDescripcion(trim($data['descripcion']));

        $em->persist($producto);
        $em->flush();

        return $this->json([
            'status' => 'ok',
            'message' => 'Producto creado correctamente.',
            'producto' => [
                'id' => $producto->getId(),
                'nombre' => $producto->getNombre(),
                'precio' => $producto->getPrecio(),
                'descripcion' => $producto->getDescripcion(),
            ]
        ]);
    }

    #[Route('/api/productos/{id}', methods: ['PUT'])]
    public function editarProducto(int $id, Request $request, EntityManagerInterface $em, ProductosRepository $productosRepository): JsonResponse
    {
        $producto = $productosRepository->find($id);
        if (!$producto) {
            return $this->json([
                'status' => 'error',
                'message' => 'Producto no encontrado.'
            ], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return $this->json([
                'status' => 'error',
                'message' => 'Datos inválidos.'
            ], 400);
        }

        if (isset($data['nombre'])) {
            $producto->setNombre(trim($data['nombre']));
        }
        if (isset($data['precio'])) {
            $producto->setPrecio(trim($data['precio']));
        }
        if (isset($data['descripcion'])) {
            $producto->setDescripcion(trim($data['descripcion']));
        }

        $em->flush();

        return $this->json([
            'status' => 'ok',
            'message' => 'Producto actualizado correctamente.',
            'producto' => [
                'id' => $producto->getId(),
                'nombre' => $producto->getNombre(),
                'precio' => $producto->getPrecio(),
                'descripcion' => $producto->getDescripcion(),
            ]
        ]);
    }

    #[Route('/api/productos/{id}', methods: ['DELETE'])]
    public function eliminarProducto(int $id, EntityManagerInterface $em, ProductosRepository $productosRepository): JsonResponse
    {
        $producto = $productosRepository->find($id);
        if (!$producto) {
            return $this->json([
                'status' => 'error',
                'message' => 'Producto no encontrado.'
            ], 404);
        }

        $em->remove($producto);
        $em->flush();

        return $this->json([
            'status' => 'ok',
            'message' => 'Producto eliminado correctamente.'
        ]);
    }
}
