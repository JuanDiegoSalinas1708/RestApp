import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { DetalleOrdenService } from '../../services/detalle-orden.service';
import { OrdenesService } from '../../services/ordenes.service';
import { ProductosService } from '../../services/productos.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-detalle-orden',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './detalle-orden.html',
  styleUrl: './detalle-orden.css',
})
export class DetalleOrden implements OnInit {
  detalles: any[] = [];
  ordenes: any[] = [];
  productos: any[] = [];
  usuario: any = null;
  nuevoDetalle: any = { cantidad: '', precio: '', id_orden: '', id_producto: '' };
  editandoDetalle: any = null;

  constructor(private detalleOrdenService: DetalleOrdenService, private ordenesService: OrdenesService, private productosService: ProductosService, private router: Router) {}

  ngOnInit() {
    const u = localStorage.getItem('usuario');
    if (!u) {
      this.router.navigate(['/login']);
      return;
    }
    this.usuario = JSON.parse(u);
    this.cargarDetalles();
    this.cargarOrdenes();
    this.cargarProductos();
  }

  cargarDetalles() {
    this.detalleOrdenService.getDetalleOrden().subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.detalles = res.data;
        }
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }

  cargarOrdenes() {
    this.ordenesService.getOrdenes().subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.ordenes = res.data;
        }
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

  crearDetalle() {
    if (!this.nuevoDetalle.cantidad || !this.nuevoDetalle.precio || !this.nuevoDetalle.id_orden || !this.nuevoDetalle.id_producto) {
      alert('Todos los campos son obligatorios.');
      return;
    }
    this.detalleOrdenService.crearDetalleOrden(this.nuevoDetalle).subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.cargarDetalles();
          this.nuevoDetalle = { cantidad: '', precio: '', id_orden: '', id_producto: '' };
        } else {
          alert(res.message);
        }
      },
      error: (err) => {
        alert('Error al crear detalle de orden.');
      }
    });
  }

  editarDetalle(det: any) {
    this.editandoDetalle = { ...det };
  }

  guardarEdicion() {
    if (!this.editandoDetalle.cantidad || !this.editandoDetalle.precio || !this.editandoDetalle.id_orden || !this.editandoDetalle.id_producto) {
      alert('Todos los campos son obligatorios.');
      return;
    }
    this.detalleOrdenService.editarDetalleOrden(this.editandoDetalle.id, this.editandoDetalle).subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.cargarDetalles();
          this.editandoDetalle = null;
        } else {
          alert(res.message);
        }
      },
      error: (err) => {
        alert('Error al editar detalle de orden.');
      }
    });
  }

  cancelarEdicion() {
    this.editandoDetalle = null;
  }

  eliminarDetalle(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este detalle de orden?')) {
      this.detalleOrdenService.eliminarDetalleOrden(id).subscribe({
        next: (res) => {
          if (res.status === 'ok') {
            this.cargarDetalles();
          } else {
            alert(res.message);
          }
        },
        error: (err) => {
          alert('Error al eliminar detalle de orden.');
        }
      });
    }
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}
