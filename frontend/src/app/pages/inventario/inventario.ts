import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { InventarioService } from '../../services/inventario.service';
import { ProductosService } from '../../services/productos.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inventario',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css',
})
export class Inventario implements OnInit {
  inventarios: any[] = [];
  productos: any[] = [];
  usuario: any = null;
  nuevoInventario: any = { id_producto: '', stock: '' };
  editandoInventario: any = null;

  constructor(private inventarioService: InventarioService, private productosService: ProductosService, private router: Router) {}

  ngOnInit() {
    const u = localStorage.getItem('usuario');
    if (!u) {
      this.router.navigate(['/login']);
      return;
    }
    this.usuario = JSON.parse(u);
    this.cargarInventario();
    this.cargarProductos();
  }

  cargarInventario() {
    this.inventarioService.getInventario().subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.inventarios = res.data;
        }
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }

  cargarProductos() {
    this.productosService.getProductos().subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.productos = res.data;
        }
      }
    });
  }

  crearInventario() {
    if (!this.nuevoInventario.id_producto || !this.nuevoInventario.stock) {
      alert('Todos los campos son obligatorios.');
      return;
    }
    this.inventarioService.crearInventario(this.nuevoInventario).subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.cargarInventario();
          this.nuevoInventario = { id_producto: '', stock: '' };
        } else {
          alert(res.message);
        }
      },
      error: (err) => {
        alert('Error al crear inventario.');
      }
    });
  }

  editarInventario(inv: any) {
    this.editandoInventario = { ...inv };
  }

  guardarEdicion() {
    if (!this.editandoInventario.id_producto || !this.editandoInventario.stock) {
      alert('Todos los campos son obligatorios.');
      return;
    }
    this.inventarioService.editarInventario(this.editandoInventario.id, this.editandoInventario).subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.cargarInventario();
          this.editandoInventario = null;
        } else {
          alert(res.message);
        }
      },
      error: (err) => {
        alert('Error al editar inventario.');
      }
    });
  }

  cancelarEdicion() {
    this.editandoInventario = null;
  }

  eliminarInventario(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este inventario?')) {
      this.inventarioService.eliminarInventario(id).subscribe({
        next: (res) => {
          if (res.status === 'ok') {
            this.cargarInventario();
          } else {
            alert(res.message);
          }
        },
        error: (err) => {
          alert('Error al eliminar inventario.');
        }
      });
    }
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}
