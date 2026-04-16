<?php

namespace App\Controller;

use App\Entity\Productos;
use App\Entity\Inventario;
use App\Repository\ProductosRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

final class ProductosController extends AbstractController
{
    #[Route('/api/productos', methods: ['GET'])]
    public function productos(ProductosRepository $productosRepository): JsonResponse
    {
        $productos = array_map(static function ($producto) {
            return [
                'id'          => $producto->getId(),
                'nombre'      => $producto->getNombre(),
                'precio'      => $producto->getPrecio(),
                'descripcion' => $producto->getDescripcion(),
            ];
        }, $productosRepository->findAll());

        return $this->json(['status' => 'ok', 'data' => $productos]);
    }

    #[Route('/api/productos', methods: ['POST'])]
    public function crearProducto(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data) || empty($data['nombre']) || empty($data['precio']) || empty($data['descripcion'])) {
            return $this->json(['status' => 'error', 'message' => 'Datos incompletos para crear el producto.'], 400);
        }

        $producto = new Productos();
        $producto->setNombre(trim($data['nombre']));
        $producto->setPrecio(trim($data['precio']));
        $producto->setDescripcion(trim($data['descripcion']));

        $em->persist($producto);
        $em->flush();

        // Crear inventario automáticamente con stock 0
        $inventario = new Inventario();
        $inventario->setProducto($producto);
        $inventario->setStock(0);
        $em->persist($inventario);
        $em->flush();

        return $this->json([
            'status'   => 'ok',
            'message'  => 'Producto creado correctamente.',
            'producto' => [
                'id'          => $producto->getId(),
                'nombre'      => $producto->getNombre(),
                'precio'      => $producto->getPrecio(),
                'descripcion' => $producto->getDescripcion(),
            ]
        ]);
    }

    #[Route('/api/productos/{id}', methods: ['PUT'])]
    public function editarProducto(int $id, Request $request, EntityManagerInterface $em, ProductosRepository $productosRepository): JsonResponse
    {
        $producto = $productosRepository->find($id);
        if (!$producto) {
            return $this->json(['status' => 'error', 'message' => 'Producto no encontrado.'], 404);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['status' => 'error', 'message' => 'Datos inválidos.'], 400);
        }

        if (isset($data['nombre']))      $producto->setNombre(trim($data['nombre']));
        if (isset($data['precio']))      $producto->setPrecio(trim($data['precio']));
        if (isset($data['descripcion'])) $producto->setDescripcion(trim($data['descripcion']));

        $em->flush();

        return $this->json([
            'status'   => 'ok',
            'message'  => 'Producto actualizado correctamente.',
            'producto' => [
                'id'          => $producto->getId(),
                'nombre'      => $producto->getNombre(),
                'precio'      => $producto->getPrecio(),
                'descripcion' => $producto->getDescripcion(),
            ]
        ]);
    }

    #[Route('/api/productos/{id}', methods: ['DELETE'])]
    public function eliminarProducto(int $id, EntityManagerInterface $em, ProductosRepository $productosRepository): JsonResponse
    {
        $producto = $productosRepository->find($id);
        if (!$producto) {
            return $this->json(['status' => 'error', 'message' => 'Producto no encontrado.'], 404);
        }

        try {
            $connection = $em->getConnection();
            $connection->beginTransaction();
            $connection->executeStatement('DELETE FROM [Detalle_Orden] WHERE [Id_Producto] = ?', [$id]);
            $connection->executeStatement('DELETE FROM [Inventario] WHERE [Id_Producto] = ?', [$id]);
            $em->remove($producto);
            $em->flush();
            $connection->commit();

            return $this->json(['status' => 'ok', 'message' => 'Producto eliminado correctamente.']);
        } catch (\Exception $e) {
            if (isset($connection) && $connection->isTransactionActive()) {
                $connection->rollBack();
            }
            return $this->json(['status' => 'error', 'message' => 'Error al eliminar: ' . $e->getMessage()], 500);
        }
    }
}