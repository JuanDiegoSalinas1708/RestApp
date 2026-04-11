import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DetalleOrdenService } from '../../services/detalle-orden.service';
import { OrdenesService } from '../../services/ordenes.service';
import { ProductosService } from '../../services/productos.service';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-detalle-orden',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './detalle-orden.component.html',
  styleUrls: ['./detalle-orden.component.css']
})
export class DetalleOrdenComponent implements OnInit {
  detalles: any[] = [];
  ordenes: any[] = [];
  productos: any[] = [];
  usuario: any = null;
  nuevoDetalle: any = { Cantidad: '', Precio: '', Id_Orden: '', Id_Producto: '' };
  editandoDetalle: any = null;

  // Modal
  modalVisible = false;
  modalTitulo = '';
  modalMensaje = '';
  modalTipo: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalAccionConfirmar: () => void = () => {};
  modalMostrarCancelar = true;

  constructor(
    private detalleOrdenService: DetalleOrdenService,
    private ordenesService: OrdenesService,
    private productosService: ProductosService,
    private router: Router
  ) {}

  ngOnInit() {
    const data = localStorage.getItem('usuario') ?? sessionStorage.getItem('usuario');
    if (!data) {
      this.router.navigate(['/login']);
      return;
    }
    this.usuario = JSON.parse(data);
    this.cargarOrdenes();
    this.cargarProductos();
    this.cargarDetalles();
  }

  mostrarModal(titulo: string, mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info' = 'info', onConfirm?: () => void, mostrarCancelar = true) {
    this.modalTitulo = titulo;
    this.modalMensaje = mensaje;
    this.modalTipo = tipo;
    this.modalAccionConfirmar = onConfirm || (() => this.cerrarModal());
    this.modalMostrarCancelar = mostrarCancelar;
    this.modalVisible = true;
  }

  cerrarModal() {
    this.modalVisible = false;
  }

  onModalConfirmado() {
    if (this.modalAccionConfirmar) {
      this.modalAccionConfirmar();
    }
    this.cerrarModal();
  }

  onModalCancelado() {
    this.cerrarModal();
  }

  cargarOrdenes() {
    this.ordenesService.getOrdenes().subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.ordenes = res.data;
        }
      },
      error: () => {
        this.mostrarModal('Error', 'Error al cargar órdenes', 'error');
      }
    });
  }

  cargarProductos() {
    this.productosService.getProductos().subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.productos = res.data;
        }
      },
      error: () => {
        this.mostrarModal('Error', 'Error al cargar productos', 'error');
      }
    });
  }

  cargarDetalles() {
    console.log('Cargando detalles...');
    this.detalleOrdenService.getDetalles().subscribe({
      next: (res) => {
        console.log('Respuesta detalles:', res);
        if (res.status === 'ok') {
          this.detalles = res.data;
        }
      },
      error: (err) => {
        console.error('Error al cargar detalles:', err);
        this.mostrarModal('Error', 'Error al cargar detalles de orden', 'error');
      }
    });
  }

  obtenerNumeroOrden(idOrden: number): string {
    const orden = this.ordenes.find(o => o.Id_Orden === idOrden);
    return orden ? `Orden #${orden.Id_Orden}` : 'Orden no encontrada';
  }

  obtenerNombreProducto(idProducto: number): string {
    const producto = this.productos.find(p => p.id === idProducto);
    return producto ? producto.nombre : 'Producto no encontrado';
  }

  calcularSubtotal(): number {
    if (this.nuevoDetalle.Cantidad && this.nuevoDetalle.Precio) {
      return Number(this.nuevoDetalle.Cantidad) * Number(this.nuevoDetalle.Precio);
    }
    return 0;
  }

  calcularSubtotalEdicion(): number {
    if (this.editandoDetalle && this.editandoDetalle.Cantidad && this.editandoDetalle.Precio) {
      return Number(this.editandoDetalle.Cantidad) * Number(this.editandoDetalle.Precio);
    }
    return 0;
  }

  calcularTotalGeneral(): number {
    let total = 0;
    for (const detalle of this.detalles) {
      total += Number(detalle.Cantidad) * Number(detalle.Precio);
    }
    return total;
  }

  validarCampos(detalle: any): boolean {
    if (!detalle.Cantidad || detalle.Cantidad <= 0) {
      this.mostrarModal('Campos inválidos', 'La cantidad debe ser mayor a 0.', 'warning');
      return false;
    }
    if (!detalle.Precio || detalle.Precio <= 0) {
      this.mostrarModal('Campos inválidos', 'El precio debe ser mayor a 0.', 'warning');
      return false;
    }
    if (!detalle.Id_Orden) {
      this.mostrarModal('Campos incompletos', 'Debes seleccionar una orden.', 'warning');
      return false;
    }
    if (!detalle.Id_Producto) {
      this.mostrarModal('Campos incompletos', 'Debes seleccionar un producto.', 'warning');
      return false;
    }
    return true;
  }

  crearDetalle() {
    if (!this.validarCampos(this.nuevoDetalle)) return;

    console.log('Creando detalle:', this.nuevoDetalle);
    this.detalleOrdenService.crearDetalle(this.nuevoDetalle).subscribe({
      next: (res) => {
        console.log('Respuesta crear:', res);
        if (res.status === 'ok') {
          this.mostrarModal('Éxito', 'Detalle de orden creado correctamente', 'success', () => {
            this.cargarDetalles();
            this.nuevoDetalle = { Cantidad: '', Precio: '', Id_Orden: '', Id_Producto: '' };
          }, false);
        } else {
          this.mostrarModal('Error', res.message, 'error');
        }
      },
      error: (err) => {
        console.error('Error crear:', err);
        this.mostrarModal('Error', 'Error al crear detalle de orden', 'error');
      }
    });
  }

  editarDetalle(detalle: any) {
    this.editandoDetalle = { ...detalle };
  }

  guardarEdicion() {
    if (!this.validarCampos(this.editandoDetalle)) return;

    this.detalleOrdenService.editarDetalle(this.editandoDetalle.Id_Detalle, this.editandoDetalle).subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.mostrarModal('Éxito', 'Detalle de orden actualizado correctamente', 'success', () => {
            this.cargarDetalles();
            this.editandoDetalle = null;
          }, false);
        } else {
          this.mostrarModal('Error', res.message, 'error');
        }
      },
      error: () => {
        this.mostrarModal('Error', 'Error al editar detalle de orden', 'error');
      }
    });
  }

  cancelarEdicion() {
    this.editandoDetalle = null;
  }

  confirmarEliminar(id: number) {
    this.mostrarModal('Confirmar eliminación', '¿Estás seguro de que quieres eliminar este detalle de orden?', 'warning', () => {
      this.eliminarDetalle(id);
    }, true);
  }

  eliminarDetalle(id: number) {
    this.detalleOrdenService.eliminarDetalle(id).subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.mostrarModal('Éxito', 'Detalle de orden eliminado correctamente', 'success', () => {
            this.cargarDetalles();
          }, false);
        } else {
          this.mostrarModal('Error', res.message, 'error');
        }
      },
      error: () => {
        this.mostrarModal('Error', 'Error al eliminar detalle de orden', 'error');
      }
    });
  }
}