<?php

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:agregar-producto',
    description: 'Agrega un nuevo producto'
)]
class AgregarProductoCommand extends Command
{
    public function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $io->title('Agregar Producto');

        $nombre = $io->ask('Nombre del producto');
        $precio = $io->ask('Precio del producto');
        $stock  = $io->ask('Stock disponible');

        // guardar en BD aquí

        $io->success("Producto '$nombre' agregado correctamente!");

        return Command::SUCCESS;
    }
}