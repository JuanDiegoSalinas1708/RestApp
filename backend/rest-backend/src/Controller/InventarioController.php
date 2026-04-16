<?php

namespace App\Controller;

use App\Entity\Inventario;
use App\Repository\InventarioRepository;
use App\Repository\ProductosRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

final class InventarioController extends AbstractController
{
    #[Route('/api/inventario', methods: ['GET'])]
    public function inventario(InventarioRepository $inventarioRepository): JsonResponse
    {
        try {
            $inventario = array_map(static function ($item) {
                return [
                    'Id_Inventario' => $item->getId(),
                    'Id_Producto'   => $item->getProducto()?->getId(),
                    'Stock'         => $item->getStock(),
                ];
            }, $inventarioRepository->findAll());

            return $this->json(['status' => 'ok', 'data' => $inventario]);
        } catch (\Exception $e) {
            return $this->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    #[Route('/api/inventario', methods: ['POST'])]
    public function crearInventario(Request $request, EntityManagerInterface $em, ProductosRepository $productosRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data) || empty($data['Id_Producto']) || !isset($data['Stock'])) {
            return $this->json(['status' => 'error', 'message' => 'Datos incompletos: se requiere Id_Producto y Stock.'], 400);
        }

        $producto = $productosRepository->find($data['Id_Producto']);
        if (!$producto) {
            return $this->json(['status' => 'error', 'message' => 'El producto especificado no existe.'], 404);
        }

        $inventario = new Inventario();
        $inventario->setProducto($producto);
        $inventario->setStock((int) $data['Stock']);

        $em->persist($inventario);
        $em->flush();

        return $this->json([
            'status'  => 'ok',
            'message' => 'Registro de inventario creado correctamente.',
            'data'    => [
                'Id_Inventario' => $inventario->getId(),
                'Id_Producto'   => $inventario->getProducto()?->getId(),
                'Stock'         => $inventario->getStock(),
            ]
        ]);
    }

    #[Route('/api/inventario/{id}', methods: ['PUT'])]
    public function editarInventario(int $id, Request $request, EntityManagerInterface $em, InventarioRepository $inventarioRepository, ProductosRepository $productosRepository): JsonResponse
    {
        $inventario = $inventarioRepository->find($id);
        if (!$inventario) {
            return $this->json(['status' => 'error', 'message' => 'Registro de inventario no encontrado.'], 404);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['status' => 'error', 'message' => 'Datos inválidos.'], 400);
        }

        if (isset($data['Id_Producto'])) {
            $producto = $productosRepository->find((int) $data['Id_Producto']);
            if (!$producto) {
                return $this->json(['status' => 'error', 'message' => 'Producto no encontrado.'], 404);
            }
            $inventario->setProducto($producto);
        }

        if (isset($data['Stock'])) {
            $inventario->setStock((int) $data['Stock']);
        }

        $em->flush();

        return $this->json([
            'status'  => 'ok',
            'message' => 'Registro de inventario actualizado correctamente.',
            'data'    => [
                'Id_Inventario' => $inventario->getId(),
                'Id_Producto'   => $inventario->getProducto()?->getId(),
                'Stock'         => $inventario->getStock(),
            ]
        ]);
    }

    #[Route('/api/inventario/{id}', methods: ['DELETE'])]
    public function eliminarInventario(int $id, EntityManagerInterface $em, InventarioRepository $inventarioRepository): JsonResponse
    {
        $inventario = $inventarioRepository->find($id);
        if (!$inventario) {
            return $this->json(['status' => 'error', 'message' => 'Registro de inventario no encontrado.'], 404);
        }

        $em->remove($inventario);
        $em->flush();

        return $this->json(['status' => 'ok', 'message' => 'Registro de inventario eliminado correctamente.']);
    }
}