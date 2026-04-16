<?php

namespace App\Controller;

use App\Entity\DetalleOrden;
use App\Repository\DetalleOrdenRepository;
use App\Repository\OrdenesRepository;
use App\Repository\ProductosRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

final class DetalleOrdenController extends AbstractController
{
    #[Route('/api/detalle-orden', methods: ['GET'])]
    public function detalleOrden(DetalleOrdenRepository $detalleOrdenRepository): JsonResponse
    {
        $detalles = array_map(static function ($detalle) {
            return [
                'Id_Detalle'  => $detalle->getId(),
                'Cantidad'    => $detalle->getCantidad(),
                'Precio'      => $detalle->getPrecio(),
                'Id_Orden'    => $detalle->getOrden()?->getId(),
                'Id_Producto' => $detalle->getProducto()?->getId(),
            ];
        }, $detalleOrdenRepository->findAll());

        return $this->json(['status' => 'ok', 'data' => $detalles]);
    }

    #[Route('/api/detalle-orden', methods: ['POST'])]
    public function crearDetalleOrden(Request $request, EntityManagerInterface $em, OrdenesRepository $ordenesRepository, ProductosRepository $productosRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data) || empty($data['Cantidad']) || empty($data['Precio']) || empty($data['Id_Orden']) || empty($data['Id_Producto'])) {
            return $this->json(['status' => 'error', 'message' => 'Datos incompletos.'], 400);
        }

        $orden = $ordenesRepository->find($data['Id_Orden']);
        if (!$orden) {
            return $this->json(['status' => 'error', 'message' => 'La orden especificada no existe.'], 404);
        }

        $producto = $productosRepository->find($data['Id_Producto']);
        if (!$producto) {
            return $this->json(['status' => 'error', 'message' => 'El producto especificado no existe.'], 404);
        }

        $detalle = new DetalleOrden();
        $detalle->setCantidad((int) $data['Cantidad']);
        $detalle->setPrecio((float) $data['Precio']);
        $detalle->setOrden($orden);
        $detalle->setProducto($producto);

        $em->persist($detalle);
        $em->flush();

        return $this->json([
            'status'  => 'ok',
            'message' => 'Detalle de orden creado correctamente.',
            'data'    => [
                'Id_Detalle'  => $detalle->getId(),
                'Cantidad'    => $detalle->getCantidad(),
                'Precio'      => $detalle->getPrecio(),
                'Id_Orden'    => $detalle->getOrden()?->getId(),
                'Id_Producto' => $detalle->getProducto()?->getId(),
            ]
        ]);
    }

    #[Route('/api/detalle-orden/{id}', methods: ['PUT'])]
    public function editarDetalleOrden(int $id, Request $request, EntityManagerInterface $em, DetalleOrdenRepository $detalleOrdenRepository, OrdenesRepository $ordenesRepository, ProductosRepository $productosRepository): JsonResponse
    {
        $detalle = $detalleOrdenRepository->find($id);
        if (!$detalle) {
            return $this->json(['status' => 'error', 'message' => 'Detalle de orden no encontrado.'], 404);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['status' => 'error', 'message' => 'Datos inválidos.'], 400);
        }

        if (isset($data['Cantidad'])) $detalle->setCantidad((int) $data['Cantidad']);
        if (isset($data['Precio']))   $detalle->setPrecio((string) $data['Precio']);

        if (isset($data['Id_Orden'])) {
            $orden = $ordenesRepository->find((int) $data['Id_Orden']);
            if (!$orden) return $this->json(['status' => 'error', 'message' => 'Orden no encontrada.'], 404);
            $detalle->setOrden($orden);
        }

        if (isset($data['Id_Producto'])) {
            $producto = $productosRepository->find((int) $data['Id_Producto']);
            if (!$producto) return $this->json(['status' => 'error', 'message' => 'Producto no encontrado.'], 404);
            $detalle->setProducto($producto);
        }

        $em->flush();

        return $this->json([
            'status'  => 'ok',
            'message' => 'Detalle de orden actualizado correctamente.',
            'data'    => [
                'Id_Detalle'  => $detalle->getId(),
                'Cantidad'    => $detalle->getCantidad(),
                'Precio'      => $detalle->getPrecio(),
                'Id_Orden'    => $detalle->getOrden()?->getId(),
                'Id_Producto' => $detalle->getProducto()?->getId(),
            ]
        ]);
    }

    #[Route('/api/detalle-orden/{id}', methods: ['DELETE'])]
    public function eliminarDetalleOrden(int $id, EntityManagerInterface $em, DetalleOrdenRepository $detalleOrdenRepository): JsonResponse
    {
        $detalle = $detalleOrdenRepository->find($id);
        if (!$detalle) {
            return $this->json(['status' => 'error', 'message' => 'Detalle de orden no encontrado.'], 404);
        }

        $em->remove($detalle);
        $em->flush();

        return $this->json(['status' => 'ok', 'message' => 'Detalle de orden eliminado correctamente.']);
    }
}