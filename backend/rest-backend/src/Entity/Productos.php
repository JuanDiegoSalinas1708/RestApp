<?php

namespace App\Entity;

use App\Repository\ProductosRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ProductosRepository::class)]
#[ORM\Table(name: 'Productos')]
class Productos
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'Id_Producto')]
    private ?int $id = null;

    #[ORM\Column(name: 'Nombre', length: 50)]
    private ?string $nombre = null;

    #[ORM\Column(name: 'Precio', type: 'decimal', precision: 10, scale: 2)]
    private ?string $precio = null;

    #[ORM\Column(name: 'Descripcion', length: 255)]
    private ?string $descripcion = null;

    #[ORM\OneToMany(targetEntity: Inventario::class, mappedBy: 'producto', cascade: ['remove'], orphanRemoval: true)]
    private Collection $inventarios;

    #[ORM\OneToMany(targetEntity: DetalleOrden::class, mappedBy: 'producto', cascade: ['remove'], orphanRemoval: true)]
    private Collection $detalleOrdenes;

    public function __construct()
    {
        $this->inventarios = new ArrayCollection();
        $this->detalleOrdenes = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getNombre(): ?string { return $this->nombre; }
    public function setNombre(string $nombre): static { $this->nombre = $nombre; return $this; }

    public function getPrecio(): ?string { return $this->precio; }
    public function setPrecio(string $precio): static { $this->precio = $precio; return $this; }

    public function getDescripcion(): ?string { return $this->descripcion; }
    public function setDescripcion(string $descripcion): static { $this->descripcion = $descripcion; return $this; }

    /**
     * @return Collection<int, Inventario>
     */
    public function getInventarios(): Collection
    {
        return $this->inventarios;
    }

    /**
     * @return Collection<int, DetalleOrden>
     */
    public function getDetalleOrdenes(): Collection
    {
        return $this->detalleOrdenes;
    }
}
