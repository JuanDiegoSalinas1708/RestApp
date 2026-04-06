<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\EntityManagerInterface;

final class TestController extends AbstractController
{
    #[Route('/test-db', methods: ['GET'])]
    public function testDB(EntityManagerInterface $em): Response
    {
        try {
            $conn = $em->getConnection();
            $conn->executeQuery('Select 1');

            return $this->json([
                'status' => 'ok',
                'message' => 'Conexion a la BD exitosa'
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
    }
}
