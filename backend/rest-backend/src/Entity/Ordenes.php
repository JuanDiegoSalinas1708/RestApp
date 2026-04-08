<?php

namespace App\Entity;

use App\Repository\OrdenesRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: OrdenesRepository::class)]
#[ORM\Table(name: 'Ordenes')]
class Ordenes
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'Id_Orden')]
    private ?int $id = null;

    #[ORM\Column(name: 'Estado', length: 20)]
    private ?string $estado = null;

    #[ORM\Column(name: 'Fecha', type: Types::DATE_MUTABLE)]
    private ?\DateTimeInterface $fecha = null;

    #[ORM\ManyToOne(targetEntity: Usuarios::class)]
    #[ORM\JoinColumn(name: 'Id_Usuario', referencedColumnName: 'Id_Usuario', nullable: false, onDelete: 'CASCADE')]
    private ?Usuarios $usuario = null;

    #[ORM\OneToMany(targetEntity: DetalleOrden::class, mappedBy: 'orden', cascade: ['remove'], orphanRemoval: true)]
    private Collection $detalleOrdenes;

    public function __construct()
    {
        $this->detalleOrdenes = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEstado(): ?string
    {
        return $this->estado;
    }

    public function setEstado(string $estado): static
    {
        $this->estado = $estado;

        return $this;
    }

    public function getFecha(): ?\DateTimeInterface
    {
        return $this->fecha;
    }

    public function setFecha(\DateTimeInterface $fecha): static
    {
        $this->fecha = $fecha;

        return $this;
    }

    public function getUsuario(): ?Usuarios
    {
        return $this->usuario;
    }

    public function setUsuario(?Usuarios $usuario): static
    {
        $this->usuario = $usuario;

        return $this;
    }

    /**
     * @return Collection<int, DetalleOrden>
     */
    public function getDetalleOrdenes(): Collection
    {
        return $this->detalleOrdenes;
    }
}
