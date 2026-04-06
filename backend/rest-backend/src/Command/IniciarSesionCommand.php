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
    name:'app:iniciar-sesion',
    description:'Iniciar Sesion',
)]
class IniciarSesionCommand extends Command
{
    public function __construct(private EntityManagerInterface $em)
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input,OutputInterface $output):int
    {
        $io = new SymfonyStyle($input,$output);
        $io->title ('Iniciar Sesion');
        
        $correo=$io->ask('Correo');
        $password=$io->askHidden('Password');
        $usuario = $this->em->getRepository(Usuarios::class)->findOneBy(['correo'=>$correo,'password'=>md5($password)]);
        if(!$usuario){
            $io->error('Correo o Password Incorrecto!');
            return Command::FAILURE;
        }

        $io->success('Inicio de Sesion Exitoso!');
        return Command::SUCCESS;
        
    }
}