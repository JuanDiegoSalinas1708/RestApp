<?php

namespace App\Controller;

use App\Entity\Usuarios;
use App\Entity\Productos;
use App\Entity\Inventario;
use App\Entity\Ordenes;
use App\Entity\DetalleOrden;
use App\Repository\ProductosRepository;
use App\Repository\UsuariosRepository;
use App\Repository\InventarioRepository;
use App\Repository\OrdenesRepository;
use App\Repository\DetalleOrdenRepository;
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
        $usuario->setPassword(password_hash(trim($data['password']), PASSWORD_BCRYPT));
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
            'estado' => true,
        ]);

        if ($usuario === null || !password_verify(trim($data['password']), $usuario->getPassword())) {
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

    // ============ PRODUCTOS ============

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

        $producto = new Productos();
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

        try {
            $connection = $em->getConnection();
            $connection->beginTransaction();
            
            $connection->executeStatement('DELETE FROM [Detalle_Orden] WHERE [Id_Producto] = ?', [$id]);
            $connection->executeStatement('DELETE FROM [Inventario] WHERE [Id_Producto] = ?', [$id]);
            
            $em->remove($producto);
            $em->flush();
            
            $connection->commit();

            return $this->json([
                'status' => 'ok',
                'message' => 'Producto eliminado correctamente.'
            ]);
        } catch (\Exception $e) {
            if (isset($connection) && $connection->isTransactionActive()) {
                $connection->rollBack();
            }
            
            return $this->json([
                'status' => 'error',
                'message' => 'Error al eliminar: ' . $e->getMessage()
            ], 500);
        }
    }

    // ============ INVENTARIO ============

    #[Route('/api/inventario', methods: ['GET'])]
    public function inventario(InventarioRepository $inventarioRepository): JsonResponse
    {
        $inventario = array_map(static function ($item) {
            return [
                'Id_Inventario' => $item->getIdInventario(),
                'Id_Producto' => $item->getIdProducto(),
                'Stock' => $item->getStock(),
            ];
        }, $inventarioRepository->findAll());

        return $this->json([
            'status' => 'ok',
            'data' => $inventario,
        ]);
    }

    #[Route('/api/inventario', methods: ['POST'])]
    public function crearInventario(Request $request, EntityManagerInterface $em, ProductosRepository $productosRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data) || empty($data['Id_Producto']) || !isset($data['Stock'])) {
            return $this->json([
                'status' => 'error',
                'message' => 'Datos incompletos: se requiere Id_Producto y Stock.'
            ], 400);
        }

        $producto = $productosRepository->find($data['Id_Producto']);
        if (!$producto) {
            return $this->json([
                'status' => 'error',
                'message' => 'El producto especificado no existe.'
            ], 404);
        }

        $inventario = new Inventario();
        $inventario->setIdProducto((int) $data['Id_Producto']);
        $inventario->setStock((int) $data['Stock']);

        $em->persist($inventario);
        $em->flush();

        return $this->json([
            'status' => 'ok',
            'message' => 'Registro de inventario creado correctamente.',
            'data' => [
                'Id_Inventario' => $inventario->getIdInventario(),
                'Id_Producto' => $inventario->getIdProducto(),
                'Stock' => $inventario->getStock(),
            ]
        ]);
    }

    #[Route('/api/inventario/{id}', methods: ['PUT'])]
    public function editarInventario(int $id, Request $request, EntityManagerInterface $em, InventarioRepository $inventarioRepository): JsonResponse
    {
        $inventario = $inventarioRepository->find($id);
        if (!$inventario) {
            return $this->json([
                'status' => 'error',
                'message' => 'Registro de inventario no encontrado.'
            ], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (!is_array($data)) {
            return $this->json([
                'status' => 'error',
                'message' => 'Datos inválidos.'
            ], 400);
        }

        if (isset($data['Id_Producto'])) {
            $inventario->setIdProducto((int) $data['Id_Producto']);
        }
        if (isset($data['Stock'])) {
            $inventario->setStock((int) $data['Stock']);
        }

        $em->flush();

        return $this->json([
            'status' => 'ok',
            'message' => 'Registro de inventario actualizado correctamente.',
            'data' => [
                'Id_Inventario' => $inventario->getIdInventario(),
                'Id_Producto' => $inventario->getIdProducto(),
                'Stock' => $inventario->getStock(),
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
                'message' => 'Registro de inventario no encontrado.'
            ], 404);
        }

        $em->remove($inventario);
        $em->flush();

        return $this->json([
            'status' => 'ok',
            'message' => 'Registro de inventario eliminado correctamente.'
        ]);
    }

    // ============ USUARIOS ============

    #[Route('/api/usuarios', methods: ['GET'])]
    public function usuarios(UsuariosRepository $usuariosRepository): JsonResponse
    {
        $usuarios = array_map(static function ($usuario) {
            return [
                'Id_Usuario' => $usuario->getId(),
                'Nombre' => $usuario->getNombre(),
                'Apellido' => $usuario->getApellido(),
                'Correo' => $usuario->getCorreo(),
                'Edad' => $usuario->getEdad(),
                'Estado' => $usuario->getEstado(),
            ];
        }, $usuariosRepository->findAll());

        return $this->json([
            'status' => 'ok',
            'data' => $usuarios,
        ]);
    }

    #[Route('/api/usuarios/todos', methods: ['GET'])]
    public function todosUsuarios(UsuariosRepository $usuariosRepository): JsonResponse
    {
        $usuarios = array_map(static function ($usuario) {
            return [
                'Id_Usuario' => $usuario->getId(),
                'Nombre' => $usuario->getNombre(),
                'Apellido' => $usuario->getApellido(),
                'Correo' => $usuario->getCorreo(),
                'Edad' => $usuario->getEdad(),
                'Estado' => $usuario->getEstado(),
            ];
        }, $usuariosRepository->findAll());

        return $this->json([
            'status' => 'ok',
            'data' => $usuarios,
        ]);
    }

    #[Route('/api/usuarios/{id}', methods: ['GET'])]
    public function getUsuario(int $id, UsuariosRepository $usuariosRepository): JsonResponse
    {
        $usuario = $usuariosRepository->find($id);
        if (!$usuario) {
            return $this->json([
                'status' => 'error',
                'message' => 'Usuario no encontrado.'
            ], 404);
        }

        return $this->json([
            'status' => 'ok',
            'data' => [
                'Id_Usuario' => $usuario->getId(),
                'Nombre' => $usuario->getNombre(),
                'Apellido' => $usuario->getApellido(),
                'Correo' => $usuario->getCorreo(),
                'Edad' => $usuario->getEdad(),
                'Estado' => $usuario->getEstado(),
            ]
        ]);
    }

    #[Route('/api/usuarios', methods: ['POST'])]
    public function crearUsuario(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data) || empty($data['Nombre']) || empty($data['Apellido']) || empty($data['Correo']) || empty($data['Password']) || !isset($data['Edad'])) {
            return $this->json([
                'status' => 'error',
                'message' => 'Datos incompletos: Nombre, Apellido, Correo, Password y Edad son requeridos.'
            ], 400);
        }

        $usuario = new Usuarios();
        $usuario->setNombre($data['Nombre']);
        $usuario->setApellido($data['Apellido']);
        $usuario->setCorreo($data['Correo']);
        $usuario->setPassword(md5($data['Password']));
        $usuario->setEdad((int) $data['Edad']);
        $usuario->setEstado(true);

        $em->persist($usuario);
        $em->flush();

        return $this->json([
            'status' => 'ok',
            'message' => 'Usuario creado correctamente.',
            'data' => [
                'Id_Usuario' => $usuario->getId(),
                'Nombre' => $usuario->getNombre(),
                'Apellido' => $usuario->getApellido(),
                'Correo' => $usuario->getCorreo(),
                'Edad' => $usuario->getEdad(),
                'Estado' => $usuario->getEstado(),
            ]
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

        if (isset($data['Nombre'])) {
            $usuario->setNombre($data['Nombre']);
        }
        if (isset($data['Apellido'])) {
            $usuario->setApellido($data['Apellido']);
        }
        if (isset($data['Correo'])) {
            $usuario->setCorreo($data['Correo']);
        }
        if (isset($data['Password']) && !empty($data['Password'])) {
            $usuario->setPassword(md5($data['Password']));
        }
        if (isset($data['Edad'])) {
            $usuario->setEdad((int) $data['Edad']);
        }
        if (isset($data['Estado'])) {
            $usuario->setEstado((bool) $data['Estado']);
        }

        $em->flush();

        return $this->json([
            'status' => 'ok',
            'message' => 'Usuario actualizado correctamente.',
            'data' => [
                'Id_Usuario' => $usuario->getId(),
                'Nombre' => $usuario->getNombre(),
                'Apellido' => $usuario->getApellido(),
                'Correo' => $usuario->getCorreo(),
                'Edad' => $usuario->getEdad(),
                'Estado' => $usuario->getEstado(),
            ]
        ]);
    }

    #[Route('/api/usuarios/{id}', methods: ['DELETE'])]
    public function eliminarUsuario(int $id, EntityManagerInterface $em, UsuariosRepository $usuariosRepository): JsonResponse
    {
        $usuario = $usuariosRepository->find($id);
        if (!$usuario) {
            return $this->json([
                'status' => 'error',
                'message' => 'Usuario no encontrado.'
            ], 404);
        }

        $em->remove($usuario);
        $em->flush();

        return $this->json([
            'status' => 'ok',
            'message' => 'Usuario eliminado correctamente.'
        ]);
    }

    // ============ ORDENES ============

    #[Route('/api/ordenes', methods: ['GET'])]
    public function ordenes(OrdenesRepository $ordenesRepository): JsonResponse
    {
        $ordenes = array_map(static function ($orden) {
            return [
                'Id_Orden' => $orden->getIdOrden(),
                'Estado' => $orden->getEstado(),
                'Fecha' => $orden->getFecha()->format('Y-m-d'),
                'Id_Usuario' => $orden->getIdUsuario(),
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

        if (!is_array($data) || empty($data['Estado']) || empty($data['Fecha']) || empty($data['Id_Usuario'])) {
            return $this->json([
                'status' => 'error',
                'message' => 'Datos incompletos: se requiere Estado, Fecha e Id_Usuario.'
            ], 400);
        }

        $usuario = $usuariosRepository->find($data['Id_Usuario']);
        if (!$usuario) {
            return $this->json([
                'status' => 'error',
                'message' => 'El usuario especificado no existe.'
            ], 404);
        }

        $orden = new Ordenes();
        $orden->setEstado($data['Estado']);
        $orden->setFecha(new \DateTime($data['Fecha']));
        $orden->setIdUsuario((int) $data['Id_Usuario']);

        $em->persist($orden);
        $em->flush();

        return $this->json([
            'status' => 'ok',
            'message' => 'Orden creada correctamente.',
            'data' => [
                'Id_Orden' => $orden->getIdOrden(),
                'Estado' => $orden->getEstado(),
                'Fecha' => $orden->getFecha()->format('Y-m-d'),
                'Id_Usuario' => $orden->getIdUsuario(),
            ]
        ]);
    }

    #[Route('/api/ordenes/{id}', methods: ['PUT'])]
    public function editarOrden(int $id, Request $request, EntityManagerInterface $em, OrdenesRepository $ordenesRepository): JsonResponse
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

        if (isset($data['Estado'])) {
            $orden->setEstado($data['Estado']);
        }
        if (isset($data['Fecha'])) {
            $orden->setFecha(new \DateTime($data['Fecha']));
        }
        if (isset($data['Id_Usuario'])) {
            $orden->setIdUsuario((int) $data['Id_Usuario']);
        }

        $em->flush();

        return $this->json([
            'status' => 'ok',
            'message' => 'Orden actualizada correctamente.',
            'data' => [
                'Id_Orden' => $orden->getIdOrden(),
                'Estado' => $orden->getEstado(),
                'Fecha' => $orden->getFecha()->format('Y-m-d'),
                'Id_Usuario' => $orden->getIdUsuario(),
            ]
        ]);
    }

    #[Route('/api/ordenes/{id}', methods: ['DELETE'])]
    public function eliminarOrden(int $id, EntityManagerInterface $em, OrdenesRepository $ordenesRepository): JsonResponse
    {
        $orden = $ordenesRepository->find($id);
        if (!$orden) {
            return $this->json([
                'status' => 'error',
                'message' => 'Orden no encontrada.'
            ], 404);
        }

        $em->remove($orden);
        $em->flush();

        return $this->json([
            'status' => 'ok',
            'message' => 'Orden eliminada correctamente.'
        ]);
    }

    // ============ DETALLE_ORDEN ============

    #[Route('/api/detalle-orden', methods: ['GET'])]
    public function detalleOrden(DetalleOrdenRepository $detalleOrdenRepository): JsonResponse
    {
        $detalles = array_map(static function ($detalle) {
            return [
                'Id_Detalle' => $detalle->getIdDetalle(),
                'Cantidad' => $detalle->getCantidad(),
                'Precio' => $detalle->getPrecio(),
                'Id_Orden' => $detalle->getIdOrden(),
                'Id_Producto' => $detalle->getIdProducto(),
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

        if (!is_array($data) || empty($data['Cantidad']) || empty($data['Precio']) || empty($data['Id_Orden']) || empty($data['Id_Producto'])) {
            return $this->json([
                'status' => 'error',
                'message' => 'Datos incompletos: se requiere Cantidad, Precio, Id_Orden e Id_Producto.'
            ], 400);
        }

        $orden = $ordenesRepository->find($data['Id_Orden']);
        if (!$orden) {
            return $this->json([
                'status' => 'error',
                'message' => 'La orden especificada no existe.'
            ], 404);
        }

        $producto = $productosRepository->find($data['Id_Producto']);
        if (!$producto) {
            return $this->json([
                'status' => 'error',
                'message' => 'El producto especificado no existe.'
            ], 404);
        }

        $detalle = new DetalleOrden();
        $detalle->setCantidad((int) $data['Cantidad']);
        $detalle->setPrecio((float) $data['Precio']);
        $detalle->setIdOrden((int) $data['Id_Orden']);
        $detalle->setIdProducto((int) $data['Id_Producto']);

        $em->persist($detalle);
        $em->flush();

        return $this->json([
            'status' => 'ok',
            'message' => 'Detalle de orden creado correctamente.',
            'data' => [
                'Id_Detalle' => $detalle->getIdDetalle(),
                'Cantidad' => $detalle->getCantidad(),
                'Precio' => $detalle->getPrecio(),
                'Id_Orden' => $detalle->getIdOrden(),
                'Id_Producto' => $detalle->getIdProducto(),
            ]
        ]);
    }

    #[Route('/api/detalle-orden/{id}', methods: ['PUT'])]
    public function editarDetalleOrden(int $id, Request $request, EntityManagerInterface $em, DetalleOrdenRepository $detalleOrdenRepository): JsonResponse
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

        if (isset($data['Cantidad'])) {
            $detalle->setCantidad((int) $data['Cantidad']);
        }
        if (isset($data['Precio'])) {
            $detalle->setPrecio((float) $data['Precio']);
        }
        if (isset($data['Id_Orden'])) {
            $detalle->setIdOrden((int) $data['Id_Orden']);
        }
        if (isset($data['Id_Producto'])) {
            $detalle->setIdProducto((int) $data['Id_Producto']);
        }

        $em->flush();

        return $this->json([
            'status' => 'ok',
            'message' => 'Detalle de orden actualizado correctamente.',
            'data' => [
                'Id_Detalle' => $detalle->getIdDetalle(),
                'Cantidad' => $detalle->getCantidad(),
                'Precio' => $detalle->getPrecio(),
                'Id_Orden' => $detalle->getIdOrden(),
                'Id_Producto' => $detalle->getIdProducto(),
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