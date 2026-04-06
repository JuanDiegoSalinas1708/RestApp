<?php

namespace App\Command;

use App\Entity\Productos;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:eliminar-producto',
    description: 'Elimina un producto existente'
)]
class EliminarProductoCommand extends Command
{
    public function __construct(private EntityManagerInterface $em)
    {
        parent::__construct();
    }
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $io->title('Eliminar Producto');

        $productos = $this->em->getRepository(Productos::class)->findAll();

        if (empty($productos)) {
            $io->warning('No hay productos para eliminar.');
            return Command::SUCCESS;
        }
        
        $filas = [];
        foreach ($productos as $p) {
            $filas[] = [$p->getId(), $p->getNombre(), '$' . $p->getPrecio(), $p->getDescripcion()];
        }
        $io->table(['ID','Nombre','Precio','Descripción'], $filas);

        $id = $io->ask('Ingresa el ID del producto que deseas eliminar');

        $producto = $this->em->getRepository(Productos::class)->find($id);

        if (!$producto){
            $io->error("No se encontró ningún producto con ese ID $id.");
            return Command::FAILURE;
        }
        $confirmar = $io->confirm("¿Confirmas eliminar el producto '{$producto->getNombre()}'? Esta acción no se puede deshacer.", false);
        if (!$confirmar) {
            $io->warning('Operación cancelada.');
            return Command::SUCCESS;
        }
        
        $this->em->remove($producto);
        $this->em->flush();

        $io->success("Producto '{$producto->getNombre()}' eliminado exitosamente!");
        
        return Command::SUCCESS;
    }
}