<?php

namespace App\Entity;

use App\Repository\UsuariosRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UsuariosRepository::class)]
#[ORM\Table(name: 'Usuarios')]
class Usuarios
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'Id_Usuario')] 
    private ?int $id = null;
    #[ORM\Column(name: 'Nombre', length: 50)]
    private ?string $nombre = null;

    #[ORM\Column(name: 'Apellido', length: 50)]
    private ?string $apellido = null;

    #[ORM\Column(name: 'Password', length: 255)]
    private ?string $password = null;

    #[ORM\Column(name: 'Edad')]
    private ?int $edad = null;

    #[ORM\Column(name: 'Correo', length: 100)]
    private ?string $correo = null;

    #[ORM\Column(name: 'Estado')]
    private ?bool $estado = null;

    public function getId(): ?int { return $this->id; }

    public function getNombre(): ?string { return $this->nombre; }
    public function setNombre(string $nombre): static { $this->nombre = $nombre; return $this; }

    public function getApellido(): ?string { return $this->apellido; }
    public function setApellido(string $apellido): static { $this->apellido = $apellido; return $this; }

    public function getPassword(): ?string { return $this->password; }
    public function setPassword(string $password): static { $this->password = $password; return $this; }

    public function getEdad(): ?int { return $this->edad; }
    public function setEdad(int $edad): static { $this->edad = $edad; return $this; }

    public function getCorreo(): ?string { return $this->correo; }
    public function setCorreo(string $correo): static { $this->correo = $correo; return $this; }

    public function getEstado(): ?bool { return $this->estado; }
    public function setEstado(bool $estado): static { $this->estado = $estado; return $this; }

    #[ORM\Column(name: 'intentos_fallidos', type: 'integer', options: ['default' => 0])]
    private int $intentosFallidos = 0;

    #[ORM\Column(name: 'bloqueado_hasta', type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $bloqueadoHasta = null;

    #[ORM\Column(name: 'email_verificado', type: 'boolean', options: ['default' => false])]
    private bool $emailVerificado = false;

    #[ORM\Column(name: 'token_verificacion', type: 'string', length: 255, nullable: true)]
    private ?string $tokenVerificacion = null;

    #[ORM\Column(name: 'token_recuperacion', type: 'string', length: 255, nullable: true)]
    private ?string $tokenRecuperacion = null;

    #[ORM\Column(name: 'token_recuperacion_expiracion', type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $tokenRecuperacionExpiracion = null;
    

// Getters y Setters
    public function getIntentosFallidos(): int { return $this->intentosFallidos; }
    public function setIntentosFallidos(int $intentos): self { $this->intentosFallidos = $intentos; return $this; }

    public function getBloqueadoHasta(): ?\DateTimeInterface { return $this->bloqueadoHasta; }
    public function setBloqueadoHasta(?\DateTimeInterface $fecha): self { $this->bloqueadoHasta = $fecha; return $this; }

    public function isEmailVerificado(): bool { return $this->emailVerificado; }
    public function setEmailVerificado(bool $verificado): self { $this->emailVerificado = $verificado; return $this; }

    public function getTokenVerificacion(): ?string { return $this->tokenVerificacion; }
    public function setTokenVerificacion(?string $token): self { $this->tokenVerificacion = $token; return $this; }

    public function getTokenRecuperacion(): ?string { return $this->tokenRecuperacion; }
    public function setTokenRecuperacion(?string $token): self { $this->tokenRecuperacion = $token; return $this; }

    public function getTokenRecuperacionExpiracion(): ?\DateTimeInterface { return $this->tokenRecuperacionExpiracion; }
    public function setTokenRecuperacionExpiracion(?\DateTimeInterface $fecha): self { $this->tokenRecuperacionExpiracion = $fecha; return $this; }
}