<?php

namespace App\Entity;

use App\Repository\DetalleOrdenRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DetalleOrdenRepository::class)]
#[ORM\Table(name: 'Detalle_Orden')]
class DetalleOrden
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'Id_Detalle')]
    private ?int $id = null;

    #[ORM\Column(name: 'Cantidad')]
    private ?int $cantidad = null;

    #[ORM\Column(name: 'Precio', type: 'decimal', precision: 10, scale: 2)]
    private ?string $precio = null;

    #[ORM\ManyToOne(targetEntity: Ordenes::class, inversedBy: 'detalleOrdenes')]
    #[ORM\JoinColumn(name: 'Id_Orden', referencedColumnName: 'Id_Orden', nullable: false, onDelete: 'CASCADE')]
    private ?Ordenes $orden = null;

    #[ORM\ManyToOne(targetEntity: Productos::class, inversedBy: 'detalleOrdenes')]
    #[ORM\JoinColumn(name: 'Id_Producto', referencedColumnName: 'Id_Producto', nullable: false, onDelete: 'CASCADE')]
    private ?Productos $producto = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCantidad(): ?int
    {
        return $this->cantidad;
    }


    public function setCantidad(int $cantidad): static
    {
        $this->cantidad = $cantidad;

        return $this;
    }

    public function getPrecio(): ?string
    {
        return $this->precio;
    }

    public function setPrecio(string $precio): static
    {
        $this->precio = $precio;

        return $this;
    }

    public function getOrden(): ?Ordenes
    {
        return $this->orden;
    }

    public function setOrden(?Ordenes $orden): static
    {
        $this->orden = $orden;

        return $this;
    }

    public function getProducto(): ?Productos
    {
        return $this->producto;
    }

    public function setProducto(?Productos $producto): static
    {
        $this->producto = $producto;

        return $this;
    }
}