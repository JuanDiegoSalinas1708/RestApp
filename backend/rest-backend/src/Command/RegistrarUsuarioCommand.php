<?php

namespace App\Command;

use App\Entity\Usuarios;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name:'app:registrar-usuario',
    description:'No Tienes Cuenta? ,Resgistrate ',
)]
class RegistrarUsuarioCommand extends Command
{
    public function __construct(private EntityManagerInterface $em)
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input,OutputInterface $output):int
    {
        $io = new SymfonyStyle($input,$output);
        $io->title ('Registro de Usuario');

        $nombre = $io->ask('Nombre');
        $apellido = $io->ask('Apellido');
        $correo = $io->ask('Correo');
        $password = $io->askHidden('Password');
        $edad = (int)$io->ask('Edad');

        $usuario = new Usuarios();
        $usuario->setNombre($nombre);
        $usuario->setApellido($apellido);
        $usuario->setCorreo($correo);
        $usuario->setPassword(md5($password));
        $usuario->SetEdad($edad);
        $usuario->setEstado(true);

        $this->em->persist($usuario);
        $this->em->flush();

        $io->success('Usuario Registrado Correctamente!');
        return Command::SUCCESS;
    }

}