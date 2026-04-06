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
    name: 'app:editar-producto',
    description: 'Edita un producto existente'
)]
class EditarProductoCommand extends Command
{
    public function __construct(private EntityManagerInterface $em)
    {
        parent::__construct();
    }
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io= new SymfonyStyle($input, $output);

        $io->title('Editar Producto');

        $productos = $this->em->getRepository(Productos::class)->findAll();

        if (empty($productos)){
            $io->warning('No hay productos para editar.');
            return Command::SUCCESS;
        }

        $filas = [];
        foreach ($productos as $p) {
            $filas[] = [$p->getId(), $p->getNombre(), '$' . $p->getPrecio(), $p->getDescripcion()];
        }
        $io->table(['ID', 'Nombre', 'Precio', 'Descripción'], $filas);

        $id = $io->ask('Ingresa el ID del producto que deseas editar');

        $producto = $this->em->getRepository(Productos::class)->find($id);

        if (!$producto) {
            $io->error("No se encontró ningún producto con ese ID $id.");
            return Command::FAILURE;
        }

        $nombre = $io->ask('Nombre del producto', $producto->getNombre());
        $precio = $io->ask('Precio del producto', $producto->getPrecio());
        $descripcion = $io->ask('Descripción del producto', $producto->getDescripcion());

        if (!$nombre || !$precio || !$descripcion) {
            $io->error('Todos los campos son obligatorios.');
            return Command::FAILURE;
        }
        if (!is_numeric($precio) || $precio <= 0) {
            $io->error('El precio debe ser un número mayor a 0.');
            return Command::FAILURE;
        }

        $confirmar = $io->confirm("¿Confirma que desea editar el producto '$nombre' por \$$precio?", true);
        if (!$confirmar){
            $io->warning('Edición cancelada.');
            return Command::SUCCESS;
        }
        $producto->setNombre($nombre);
        $producto->setPrecio($precio);
        $producto->setDescripcion($descripcion);

        $this->em->flush();

        $io->success("Producto '$nombre' editado correctamente!");

        return Command::SUCCESS;
    }
}