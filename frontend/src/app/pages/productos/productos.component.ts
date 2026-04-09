import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { ProductosService } from '../../services/productos.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  productos: any[] = [];
  usuario: any = null;
  nuevoProducto: any = { nombre: '', precio: '', descripcion: '' };
  editandoProducto: any = null;

  constructor(private productosService: ProductosService, private router: Router) {}

  ngOnInit() {
    const u = localStorage.getItem('usuario');
    if (!u) {
      this.router.navigate(['/login']);
      return;
    }
    this.usuario = JSON.parse(u);
    this.cargarProductos();
  }

  cargarProductos() {
    this.productosService.getProductos().subscribe({
      next: (res:any) => {
        if (res.status === 'ok') {
          this.productos = res.data;
        }
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }

  crearProducto() {
    if (!this.nuevoProducto.nombre || !this.nuevoProducto.precio || !this.nuevoProducto.descripcion) {
      alert('Todos los campos son obligatorios.');
      return;
    }
    this.productosService.crearProducto(this.nuevoProducto).subscribe({
      next: (res:any) => {
        if (res.status === 'ok') {
          this.cargarProductos();
          this.nuevoProducto = { nombre: '', precio: '', descripcion: '' };
        } else {
          alert(res.message);
        }
      },
      error: () => {
        alert('Error al crear producto.');
      }
    });
  }

  editarProducto(producto: any) {
    this.editandoProducto = { ...producto };
  }

  guardarEdicion() {
    if (!this.editandoProducto.nombre || !this.editandoProducto.precio || !this.editandoProducto.descripcion) {
      alert('Todos los campos son obligatorios.');
      return;
    }
    this.productosService.editarProducto(this.editandoProducto.id, this.editandoProducto).subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.cargarProductos();
          this.editandoProducto = null;
        } else {
          alert(res.message);
        }
      },
      error: () => {
        alert('Error al editar producto.');
      }
    });
  }

  cancelarEdicion() {
    this.editandoProducto = null;
  }

  eliminarProducto(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      this.productosService.eliminarProducto(id).subscribe({
        next: (res) => {
          if (res.status === 'ok') {
            this.cargarProductos();
          } else {
            alert(res.message);
          }
        },
        error: () => {
          alert('Error al eliminar producto.');
        }
      });
    }
  }
}