<?php

namespace App\Entity;

use App\Repository\InventarioRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: InventarioRepository::class)]
#[ORM\Table(name: 'Inventario')]
class Inventario
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'Id_Inventario')]
    private ?int $id = null;

    #[ORM\Column(name: 'Stock')]
    private ?int $stock = null;

#[ORM\ManyToOne(targetEntity: Productos::class, inversedBy: 'inventarios')]
    #[ORM\JoinColumn(name: 'Id_Producto', referencedColumnName: 'Id_Producto', nullable: false, onDelete: 'CASCADE')]
    private ?Productos $producto = null;

    public function getId(): ?int
     {
        return $this->id;
    }

    public function getStock(): ?int
    {
        return $this->stock;
    }

    public function getIdInventario(): ?int
    {
        return $this->id;
    }

    public function getIdProducto(): ?int
    {
        return $this->id;
    }

    public function setIdProducto(int $id): static
    {
        $this->id = $id;

        return $this;
    }

    public function setStock(int $stock): static
    {
        $this->stock = $stock;

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