<?php

namespace App\Controller;

use App\Entity\Usuarios;
use App\Entity\Inventario;
use App\Entity\Ordenes;
use App\Entity\DetalleOrden;
use App\Repository\UsuariosRepository;
use App\Repository\InventarioRepository;
use App\Repository\ProductosRepository;
use App\Repository\OrdenesRepository;
use App\Repository\DetalleOrdenRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

final class ApiAdditionalController extends AbstractController
{
    #[Route('/api/usuarios', methods: ['GET'])]
    public function usuarios(UsuariosRepository $usuariosRepository): JsonResponse
    {
        $usuarios = array_map(static function ($usuario) {
            return [
                'id' => $usuario->getId(),
                'nombre' => $usuario->getNombre(),
                'apellido' => $usuario->getApellido(),
                'correo' => $usuario->getCorreo(),
                'edad' => $usuario->getEdad(),
                'estado' => $usuario->getEstado(),
            ];
        }, $usuariosRepository->findAll());

        return $this->json([
            'status' => 'ok',
            'data' => $usuarios,
        ]);
    }

    #[Route('/api/usuarios/{id}', methods: ['PUT'])]
    public function editarUsuario(int $id, Request $request, EntityManagerInterface $em, UsuariosRepository $usuariosRepository): JsonResponse
    {
        $usuario = $usuariosRepository->find($id);
        if (!$usuario) {
            return $this->json([
                'status' => 'error',
                'message' => 'Usuario no encontrado.'
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
            $usuario->setNombre(trim($data['nombre']));
        }
        if (isset($data['apellido'])) {
            $usuario->setApellido(trim($data['apellido']));
        }
        if (isset($data['correo'])) {
            $correo = trim($data['correo']);
            $existing = $usuariosRepository->findOneBy(['correo' => $correo]);
            if ($existing && $existing->getId() !== $id) {
                return $this->json([
                    'status' => 'error',
                    'message' => 'Ya existe un usuario con ese correo.'
                ], 400);
            }
            $usuario->setCorreo($correo);
        }
        if (isset($data['password'])) {
            $usuario->setPassword(password_hash(trim($data['password']), PASSWORD_BCRYPT));
        }
        if (isset($data['edad'])) {
            $usuario->setEdad((int) $data['edad']);
        }
        if (isset($data['estado'])) {
            $usuario->setEstado((bool) $data['estado']);
        }

        $em->flush();

        return $this->json([
            'status' => 'ok',
            'message' => 'Usuario actualizado correctamente.',
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

    #[Route('/api/usuarios/{id}', methods: ['DELETE'])]
    public function eliminarUsuario(int $id, EntityManagerInterface $em, UsuariosRepository $usuariosRepository, OrdenesRepository $ordenesRepository): JsonResponse
    {
        $usuario = $usuariosRepository->find($id);
        if (!$usuario) {
            return $this->json([
                'status' => 'error',
                'message' => 'Usuario no encontrado.'
            ], 404);
        }

        // Check if there are related Ordenes
        if (!empty($ordenesRepository->findBy(['usuario' => $usuario]))) {
            return $this->json([
                'status' => 'error',
                'message' => 'No se puede eliminar el usuario porque tiene órdenes relacionadas.'
            ], 400);
        }

        $em->remove($usuario);
        $em->flush();

        return $this->json([
            'status' => 'ok',
            'message' => 'Usuario eliminado correctamente.'
        ]);
    }

    #[Route('/api/inventario', methods: ['GET'])]
    public function inventario(InventarioRepository $inventarioRepository): JsonResponse
    {
        $inventarios = array_map(static function ($inv) {
            return [
                'id' => $inv->getId(),
                'id_producto' => $inv->getProducto()->getId(),
                'stock' => $inv->getStock(),
            ];
        }, $inventarioRepository->findAll());

        return $this->json([
            'status' => 'ok',
            'data' => $inventarios,
        ]);
    }

    #[Route('/api/inventario', methods: ['POST'])]
    public function crearInventario(Request $request, EntityManagerInterface $em, ProductosRepository $productosRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data) || !isset($data['id_producto']) || !isset($data['stock'])) {
            return $this->json([
                'status' => 'error',
                'message' => 'Datos incompletos para crear el inventario.'
            ], 400);
        }

        $producto = $productosRepository->find($data['id_producto']);
        if (!$producto) {
            return $this->json([
                'status' => 'error',
                'message' => 'Producto no encontrado.'
            ], 404);
        }

        $inventario = new Inventario();
        $inventario->setProducto($producto);
        $inventario->setStock((int) $data['stock']);

        $em->persist($inventario);
        $em->flush();

        return $this->json([
            'status' => 'ok',
            'message' => 'Inventario creado correctamente.',
            'inventario' => [
                'id' => $inventario->getId(),
                'id_producto' => $inventario->getProducto()->getId(),
                'stock' => $inventario->getStock(),
            ]
        ]);
    }

    #[Route('/api/inventario/{id}', methods: ['PUT'])]
    public function editarInventario(int $id, Request $request, EntityManagerInterface $em, InventarioRepository $inventarioRepository, ProductosRepository $productosRepository): JsonResponse
    {
        $inventario = $inventarioRepository->find($id);
        if (!$inventario) {
            return $this->json([
                'status' => 'error',
                'message' => 'Inventario no encontrado.'
            ], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return $this->json([
                'status' => 'error',
                'message' => 'Datos inválidos.'
            ], 400);
        }

        if (isset($data['id_producto'])) {
            $producto = $productosRepository->find($data['id_producto']);
            if (!$producto) {
                return $this->json([
                    'status' => 'error',
                    'message' => 'Producto no encontrado.'
                ], 404);
            }
            $inventario->setProducto($producto);
        }
        if (isset($data['stock'])) {
            $inventario->setStock((int) $data['stock']);
        }

        $em->flush();

        return $this->json([
            'status' => 'ok',
            'message' => 'Inventario actualizado correctamente.',
            'inventario' => [
                'id' => $inventario->getId(),
                'id_producto' => $inventario->getProducto()->getId(),
                'stock' => $inventario->getStock(),
            ]
        ]);
    }

    #[Route('/api/inventario/{id}', methods: ['DELETE'])]
    public function eliminarInventario(int $id, EntityManagerInterface $em, InventarioRepository $inventarioRepository): JsonResponse
    {
        $inventario = $inventarioRepository->find($id);
        if (!$inventario) {
            return $this->json([
                'status' => 'error',
                'message' => 'Inventario no encontrado.'
            ], 404);
        }

        $em->remove($inventario);
        $em->flush();

        return $this->json([
            'status' => 'ok',
            'message' => 'Inventario eliminado correctamente.'
        ]);
    }

    #[Route('/api/ordenes', methods: ['GET'])]
    public function ordenes(OrdenesRepository $ordenesRepository): JsonResponse
    {
        $ordenes = array_map(static function ($orden) {
            return [
                'id' => $orden->getId(),
                'estado' => $orden->getEstado(),
                'fecha' => $orden->getFecha()->format('Y-m-d'),
                'id_usuario' => $orden->getUsuario()->getId(),
            ];
        }, $ordenesRepository->findAll());

        return $this->json([
            'status' => 'ok',
            'data' => $ordenes,
        ]);
    }

    #[Route('/api/ordenes', methods: ['POST'])]
    public function crearOrden(Request $request, EntityManagerInterface $em, UsuariosRepository $usuariosRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data) || empty($data['estado']) || empty($data['fecha']) || !isset($data['id_usuario'])) {
            return $this->json([
                'status' => 'error',
                'message' => 'Datos incompletos para crear la orden.'
            ], 400);
        }

        $usuario = $usuariosRepository->find($data['id_usuario']);
        if (!$usuario) {
            return $this->json([
                'status' => 'error',
                'message' => 'Usuario no encontrado.'
            ], 404);
        }

        $orden = new Ordenes();
        $orden->setEstado(trim($data['estado']));
        $orden->setFecha(new \DateTime($data['fecha']));
        $orden->setUsuario($usuario);

        $em->persist($orden);
        $em->flush();

        return $this->json([
            'status' => 'ok',
            'message' => 'Orden creada correctamente.',
            'orden' => [
                'id' => $orden->getId(),
                'estado' => $orden->getEstado(),
                'fecha' => $orden->getFecha()->format('Y-m-d'),
                'id_usuario' => $orden->getUsuario()->getId(),
            ]
        ]);
    }

    #[Route('/api/ordenes/{id}', methods: ['PUT'])]
    public function editarOrden(int $id, Request $request, EntityManagerInterface $em, OrdenesRepository $ordenesRepository, UsuariosRepository $usuariosRepository): JsonResponse
    {
        $orden = $ordenesRepository->find($id);
        if (!$orden) {
            return $this->json([
                'status' => 'error',
                'message' => 'Orden no encontrada.'
            ], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return $this->json([
                'status' => 'error',
                'message' => 'Datos inválidos.'
            ], 400);
        }

        if (isset($data['estado'])) {
            $orden->setEstado(trim($data['estado']));
        }
        if (isset($data['fecha'])) {
            $orden->setFecha(new \DateTime($data['fecha']));
        }
        if (isset($data['id_usuario'])) {
            $usuario = $usuariosRepository->find($data['id_usuario']);
            if (!$usuario) {
                return $this->json([
                    'status' => 'error',
                    'message' => 'Usuario no encontrado.'
                ], 404);
            }
            $orden->setUsuario($usuario);
        }

        $em->flush();

        return $this->json([
            'status' => 'ok',
            'message' => 'Orden actualizada correctamente.',
            'orden' => [
                'id' => $orden->getId(),
                'estado' => $orden->getEstado(),
                'fecha' => $orden->getFecha()->format('Y-m-d'),
                'id_usuario' => $orden->getUsuario()->getId(),
            ]
        ]);
    }

    #[Route('/api/ordenes/{id}', methods: ['DELETE'])]
    public function eliminarOrden(int $id, EntityManagerInterface $em, OrdenesRepository $ordenesRepository, DetalleOrdenRepository $detalleOrdenRepository): JsonResponse
    {
        $orden = $ordenesRepository->find($id);
        if (!$orden) {
            return $this->json([
                'status' => 'error',
                'message' => 'Orden no encontrada.'
            ], 404);
        }

        // Check if there are related DetalleOrden
        if (!empty($detalleOrdenRepository->findBy(['orden' => $orden]))) {
            return $this->json([
                'status' => 'error',
                'message' => 'No se puede eliminar la orden porque tiene detalles relacionados.'
            ], 400);
        }

        $em->remove($orden);
        $em->flush();

        return $this->json([
            'status' => 'ok',
            'message' => 'Orden eliminada correctamente.'
        ]);
    }

    #[Route('/api/detalle-orden', methods: ['GET'])]
    public function detalleOrden(DetalleOrdenRepository $detalleOrdenRepository): JsonResponse
    {
        $detalles = array_map(static function ($det) {
            return [
                'id' => $det->getId(),
                'cantidad' => $det->getCantidad(),
                'precio' => $det->getPrecio(),
                'id_orden' => $det->getOrden()->getId(),
                'id_producto' => $det->getProducto()->getId(),
            ];
        }, $detalleOrdenRepository->findAll());

        return $this->json([
            'status' => 'ok',
            'data' => $detalles,
        ]);
    }

    #[Route('/api/detalle-orden', methods: ['POST'])]
    public function crearDetalleOrden(Request $request, EntityManagerInterface $em, OrdenesRepository $ordenesRepository, ProductosRepository $productosRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data) || !isset($data['cantidad']) || !isset($data['precio']) || !isset($data['id_orden']) || !isset($data['id_producto'])) {
            return $this->json([
                'status' => 'error',
                'message' => 'Datos incompletos para crear el detalle de orden.'
            ], 400);
        }

        $orden = $ordenesRepository->find($data['id_orden']);
        if (!$orden) {
            return $this->json([
                'status' => 'error',
                'message' => 'Orden no encontrada.'
            ], 404);
        }

        $producto = $productosRepository->find($data['id_producto']);
        if (!$producto) {
            return $this->json([
                'status' => 'error',
                'message' => 'Producto no encontrado.'
            ], 404);
        }

        $detalle = new DetalleOrden();
        $detalle->setCantidad((int) $data['cantidad']);
        $detalle->setPrecio(trim($data['precio']));
        $detalle->setOrden($orden);
        $detalle->setProducto($producto);

        $em->persist($detalle);
        $em->flush();

        return $this->json([
            'status' => 'ok',
            'message' => 'Detalle de orden creado correctamente.',
            'detalle' => [
                'id' => $detalle->getId(),
                'cantidad' => $detalle->getCantidad(),
                'precio' => $detalle->getPrecio(),
                'id_orden' => $detalle->getOrden()->getId(),
                'id_producto' => $detalle->getProducto()->getId(),
            ]
        ]);
    }

    #[Route('/api/detalle-orden/{id}', methods: ['PUT'])]
    public function editarDetalleOrden(int $id, Request $request, EntityManagerInterface $em, DetalleOrdenRepository $detalleOrdenRepository, OrdenesRepository $ordenesRepository, ProductosRepository $productosRepository): JsonResponse
    {
        $detalle = $detalleOrdenRepository->find($id);
        if (!$detalle) {
            return $this->json([
                'status' => 'error',
                'message' => 'Detalle de orden no encontrado.'
            ], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return $this->json([
                'status' => 'error',
                'message' => 'Datos inválidos.'
            ], 400);
        }

        if (isset($data['cantidad'])) {
            $detalle->setCantidad((int) $data['cantidad']);
        }
        if (isset($data['precio'])) {
            $detalle->setPrecio(trim($data['precio']));
        }
        if (isset($data['id_orden'])) {
            $orden = $ordenesRepository->find($data['id_orden']);
            if (!$orden) {
                return $this->json([
                    'status' => 'error',
                    'message' => 'Orden no encontrada.'
                ], 404);
            }
            $detalle->setOrden($orden);
        }
        if (isset($data['id_producto'])) {
            $producto = $productosRepository->find($data['id_producto']);
            if (!$producto) {
                return $this->json([
                    'status' => 'error',
                    'message' => 'Producto no encontrado.'
                ], 404);
            }
            $detalle->setProducto($producto);
        }

        $em->flush();

        return $this->json([
            'status' => 'ok',
            'message' => 'Detalle de orden actualizado correctamente.',
            'detalle' => [
                'id' => $detalle->getId(),
                'cantidad' => $detalle->getCantidad(),
                'precio' => $detalle->getPrecio(),
                'id_orden' => $detalle->getOrden()->getId(),
                'id_producto' => $detalle->getProducto()->getId(),
            ]
        ]);
    }

    #[Route('/api/detalle-orden/{id}', methods: ['DELETE'])]
    public function eliminarDetalleOrden(int $id, EntityManagerInterface $em, DetalleOrdenRepository $detalleOrdenRepository): JsonResponse
    {
        $detalle = $detalleOrdenRepository->find($id);
        if (!$detalle) {
            return $this->json([
                'status' => 'error',
                'message' => 'Detalle de orden no encontrado.'
            ], 404);
        }

        $em->remove($detalle);
        $em->flush();

        return $this->json([
            'status' => 'ok',
            'message' => 'Detalle de orden eliminado correctamente.'
        ]);
    }
}
