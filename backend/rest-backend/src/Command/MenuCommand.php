<?php

namespace App\Command;

use App\Entity\Usuarios;
use App\Entity\Productos;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:menu',
    description: 'Menu Principal de la Aplicacion',
)]
class MenuCommand extends Command
{
    public function __construct(private EntityManagerInterface $em)
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        while (true) {
            $io->title('TE DAMOS LA BIENVENIDA A LA APP_REST');
            $io->writeln('[1] Crear Cuenta');
            $io->writeln('[2] Iniciar Sesion');
            $io->writeln('[3] Salir');
            $io->writeln('');

            $opcion = $io->ask('Seleciona una Opcion');

            if ($opcion === '1') {
                $this->registrar($io);
            } elseif ($opcion === '2') {
                $this->iniciarSesion($io);
            } else {
                $io->success('Gracias por Usar App_Rest, Hasta Luego!');
                return Command::SUCCESS;
            }
        }
    }

    private function registrar(SymfonyStyle $io): void
    {
        $io->section('Crear Cuenta');

        $nombre   = $io->ask('Nombre');
        $apellido = $io->ask('Apellido');
        $correo   = $io->ask('Correo');

        $existe = $this->em->getRepository(Usuarios::class)->findOneBy(['correo' => $correo]);
        if ($existe) {
            $io->error('Ese correo ya esta registrado!');
            return;
        }

        $password = $io->askHidden('Password');
        $edad     = (int) $io->ask('Edad');

        $usuario = new Usuarios();
        $usuario->setNombre($nombre);
        $usuario->setApellido($apellido);
        $usuario->setCorreo($correo);
        $usuario->setPassword(md5($password));
        $usuario->setEdad($edad);
        $usuario->setEstado(true);

        $this->em->persist($usuario);
        $this->em->flush();

        $io->success('Cuenta Creada Exitosamente!');
    }

    private function iniciarSesion(SymfonyStyle $io): void
    {
        $io->section('Iniciar Sesion');

        $correo   = $io->ask('Correo');
        $password = $io->askHidden('Password');

        $usuario = $this->em->getRepository(Usuarios::class)->findOneBy([
            'correo'   => $correo,
            'password' => md5($password),
        ]);

        if (!$usuario) {
            $io->error('Correo o Password Incorrecto!');
            return;
        }

        $io->success('Bienvenido ' . $usuario->getNombre() . ' ' . $usuario->getApellido() . '!');
        $this->menuUsuario($io, $usuario);
    }

    private function menuUsuario(SymfonyStyle $io, Usuarios $usuario): void
    {
        while (true) {
            $io->title('MENU PRINCIPAL');
            $io->writeln('[1] Ver Productos');
            $io->writeln('[2] Agregar Producto');
            $io->writeln('[3] Editar Producto');
            $io->writeln('[4] Eliminar Producto');
            $io->writeln('[5] Salir');
            $io->writeln('');
            $opcion = $io->ask('Selecciona una Opcion');

            if ($opcion === '1') {
                $this->verProductos($io);
            } elseif ($opcion === '2') {
                $this->agregarProducto($io);
            } elseif ($opcion === '3') {
                $this->editarProducto($io);
            } elseif ($opcion === '4') {
                $this->eliminarProducto($io);
            } else {
                $io->success('Hasta Luego!');
                return;
            }
        }
    }

    private function verProductos(SymfonyStyle $io): void
    {
        $io->section('Productos Disponibles');

        $productos = $this->em->getRepository(Productos::class)->findAll();

        if (empty($productos)) {
            $io->warning('No hay productos registrados.');
            return;
        }

        $filas = [];
        foreach ($productos as $p) {
            $filas[] = [$p->getId(), $p->getNombre(), '$' . $p->getPrecio(), $p->getDescripcion()];
        }
        $io->table(['ID', 'Nombre', 'Precio', 'Descripcion'], $filas);
    }

    private function agregarProducto(SymfonyStyle $io): void
    {
        $io->section('Agregar Producto');

        $nombre      = $io->ask('Nombre del producto');
        $precio      = $io->ask('Precio del producto');
        $descripcion = $io->ask('Descripcion del producto');

        if (!$nombre || !$precio || !$descripcion) {
            $io->error('Todos los campos son obligatorios.');
            return;
        }

        if (!is_numeric($precio) || $precio <= 0) {
            $io->error('El precio debe ser un número mayor a 0.');
            return;
        }

        $confirmar = $io->confirm("¿Confirmas agregar el producto '$nombre' por \$$precio?", true);
        if (!$confirmar) {
            $io->warning('Operacion cancelada.');
            return;
        }

        $producto = new Productos();
        $producto->setNombre($nombre);
        $producto->setPrecio($precio);
        $producto->setDescripcion($descripcion);

        $this->em->persist($producto);
        $this->em->flush();

        $io->success("Producto '$nombre' agregado exitosamente!");
    }

    private function editarProducto(SymfonyStyle $io): void
    {
        $io->section('Editar Producto');

        $productos = $this->em->getRepository(Productos::class)->findAll();

        if (empty($productos)) {
            $io->warning('No hay productos registrados.');
            return;
        }

        $filas = [];
        foreach ($productos as $p) {
            $filas[] = [$p->getId(), $p->getNombre(), '$' . $p->getPrecio(), $p->getDescripcion()];
        }
        $io->table(['ID', 'Nombre', 'Precio', 'Descripcion'], $filas);

        $id = $io->ask('Ingresa el ID del producto a editar');

        $producto = $this->em->getRepository(Productos::class)->find($id);

        if (!$producto) {
            $io->error("No se encontró ningún producto con ID $id.");
            return;
        }

        $nombre      = $io->ask('Nombre del producto', $producto->getNombre());
        $precio      = $io->ask('Precio del producto', $producto->getPrecio());
        $descripcion = $io->ask('Descripcion del producto', $producto->getDescripcion());

        if (!is_numeric($precio) || $precio <= 0) {
            $io->error('El precio debe ser un número mayor a 0.');
            return;
        }

        $confirmar = $io->confirm("¿Confirmas editar el producto '$nombre' por \$$precio?", true);
        if (!$confirmar) {
            $io->warning('Operacion cancelada.');
            return;
        }

        $producto->setNombre($nombre);
        $producto->setPrecio($precio);
        $producto->setDescripcion($descripcion);

        $this->em->flush();

        $io->success("Producto '$nombre' editado exitosamente!");
    }

    private function eliminarProducto(SymfonyStyle $io): void
    {
        $io->section('Eliminar Producto');

        $productos = $this->em->getRepository(Productos::class)->findAll();

        if (empty($productos)) {
            $io->warning('No hay productos registrados.');
            return;
        }

        $filas = [];
        foreach ($productos as $p) {
            $filas[] = [$p->getId(), $p->getNombre(), '$' . $p->getPrecio(), $p->getDescripcion()];
        }
        $io->table(['ID', 'Nombre', 'Precio', 'Descripcion'], $filas);

        $id = $io->ask('Ingresa el ID del producto a eliminar');

        $producto = $this->em->getRepository(Productos::class)->find($id);

        if (!$producto) {
            $io->error("No se encontró ningún producto con ID $id.");
            return;
        }

        $confirmar = $io->confirm("¿Confirmas eliminar el producto '{$producto->getNombre()}'? Esta acción no se puede deshacer.", false);
        if (!$confirmar) {
            $io->warning('Operacion cancelada.');
            return;
        }

        $this->em->remove($producto);
        $this->em->flush();

        $io->success("Producto '{$producto->getNombre()}' eliminado exitosamente!");
    }
}