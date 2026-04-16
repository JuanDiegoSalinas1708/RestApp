<?php

namespace App\Controller;

use App\Entity\Ordenes;
use App\Repository\OrdenesRepository;
use App\Repository\UsuariosRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

final class OrdenesController extends AbstractController
{
    #[Route('/api/ordenes', methods: ['GET'])]
    public function ordenes(OrdenesRepository $ordenesRepository): JsonResponse
    {
        $ordenes = array_map(static function ($orden) {
            return [
                'Id_Orden'   => $orden->getId(),
                'Estado'     => $orden->getEstado(),
                'Fecha'      => $orden->getFecha()->format('Y-m-d'),
                'Id_Usuario' => $orden->getIdUsuario()->getId(),
            ];
        }, $ordenesRepository->findAll());

        return $this->json(['status' => 'ok', 'data' => $ordenes]);
    }

    #[Route('/api/ordenes', methods: ['POST'])]
    public function crearOrden(Request $request, EntityManagerInterface $em, UsuariosRepository $usuariosRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!is_array($data) || empty($data['Estado']) || empty($data['Fecha']) || empty($data['Id_Usuario'])) {
            return $this->json(['status' => 'error', 'message' => 'Datos incompletos: se requiere Estado, Fecha e Id_Usuario.'], 400);
        }

        $usuario = $usuariosRepository->find($data['Id_Usuario']);
        if (!$usuario) {
            return $this->json(['status' => 'error', 'message' => 'El usuario especificado no existe.'], 404);
        }

        $orden = new Ordenes();
        $orden->setEstado($data['Estado']);
        $orden->setFecha(new \DateTime($data['Fecha']));
        $orden->setIdUsuario($usuario);

        $em->persist($orden);
        $em->flush();

        return $this->json([
            'status'  => 'ok',
            'message' => 'Orden creada correctamente.',
            'data'    => [
                'Id_Orden'   => $orden->getId(),
                'Estado'     => $orden->getEstado(),
                'Fecha'      => $orden->getFecha()->format('Y-m-d'),
                'Id_Usuario' => $orden->getIdUsuario()?->getId(),
            ]
        ]);
    }

    #[Route('/api/ordenes/{id}', methods: ['PUT'])]
    public function editarOrden(int $id, Request $request, EntityManagerInterface $em, OrdenesRepository $ordenesRepository, UsuariosRepository $usuariosRepository): JsonResponse
    {
        $orden = $ordenesRepository->find($id);
        if (!$orden) {
            return $this->json(['status' => 'error', 'message' => 'Orden no encontrada.'], 404);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['status' => 'error', 'message' => 'Datos inválidos.'], 400);
        }

        if (isset($data['Estado']))     $orden->setEstado($data['Estado']);
        if (isset($data['Fecha']))      $orden->setFecha(new \DateTime($data['Fecha']));
        if (isset($data['Id_Usuario'])) {
            $usuario = $usuariosRepository->find((int) $data['Id_Usuario']);
            if (!$usuario) {
                return $this->json(['status' => 'error', 'message' => 'Usuario no encontrado.'], 404);
            }
            $orden->setIdUsuario($usuario);
        }

        $em->flush();

        return $this->json([
            'status'  => 'ok',
            'message' => 'Orden actualizada correctamente.',
            'data'    => [
                'Id_Orden'   => $orden->getId(),
                'Estado'     => $orden->getEstado(),
                'Fecha'      => $orden->getFecha()->format('Y-m-d'),
                'Id_Usuario' => $orden->getIdUsuario()?->getId(),
            ]
        ]);
    }

    #[Route('/api/ordenes/{id}', methods: ['DELETE'])]
    public function eliminarOrden(int $id, EntityManagerInterface $em, OrdenesRepository $ordenesRepository): JsonResponse
    {
        $orden = $ordenesRepository->find($id);
        if (!$orden) {
            return $this->json(['status' => 'error', 'message' => 'Orden no encontrada.'], 404);
        }

        $em->remove($orden);
        $em->flush();

        return $this->json(['status' => 'ok', 'message' => 'Orden eliminada correctamente.']);
    }
}