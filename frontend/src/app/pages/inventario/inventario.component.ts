import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.services';
import { ProductosService } from '../../services/productos.service';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit {
  inventario: any[] = [];
  productos: any[] = [];
  usuario: any = null;
  nuevoItem: any = { Id_Producto: '', Stock: '' };
  editandoItem: any = null;

  // Modal
  modalVisible = false;
  modalTitulo = '';
  modalMensaje = '';
  modalTipo: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalAccionConfirmar: () => void = () => {};
  modalMostrarCancelar = true;

  constructor(
    private inventarioService: InventarioService,
    private productosService: ProductosService,
    private router: Router
  ) {}

  ngOnInit() {
    const u = localStorage.getItem('usuario') ?? sessionStorage.getItem('usuario');
    if (!u) {
      this.router.navigate(['/login']);
      return;
    }
    this.usuario = JSON.parse(u);
    this.cargarProductos();
    this.cargarInventario();
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

    cargarInventario() {
        console.log('Cargando inventario...');
        this.inventarioService.getInventario().subscribe({
            next: (res) =>{
                console.log('Respuesta del inventario:', res);
                if (res.status ==='ok'){
                    this.inventario = res.data;
                }
            },
            error:(err) =>{
                console.error('Error al cargar inventario:', err);
                this.mostrarModal('Error', 'Error al cargar inventario', 'error');
            }
        });
    }

  obtenerNombreProducto(idProducto: number): string {
    const producto = this.productos.find(p => p.id === idProducto);
    return producto ? producto.nombre : 'Producto no encontrado';
  }

  validarCampos(item: any): boolean {
    if (!item.Id_Producto) {
      this.mostrarModal('Campos incompletos', 'Debes seleccionar un producto.', 'warning');
      return false;
    }
    if (!item.Stock && item.Stock !== 0) {
      this.mostrarModal('Campos incompletos', 'El stock es obligatorio.', 'warning');
      return false;
    }
    if (item.Stock < 0) {
      this.mostrarModal('Stock inválido', 'El stock no puede ser negativo.', 'warning');
      return false;
    }
    return true;
  }

crearItem() {
  if (!this.validarCampos(this.nuevoItem)) return;

  console.log('Creando item:', this.nuevoItem);
  this.inventarioService.crearInventario(this.nuevoItem).subscribe({
    next: (res) => {
      console.log('Respuesta crear:', res);
      if (res.status === 'ok') {
        this.mostrarModal('Éxito', 'Registro de inventario creado correctamente', 'success', () => {
          this.cargarInventario();  // ✅ Recargar la tabla
          this.nuevoItem = { Id_Producto: '', Stock: '' };
        }, false);
      } else {
        this.mostrarModal('Error', res.message, 'error');
      }
    },
    error: (err) => {
      console.error('Error crear:', err);
      this.mostrarModal('Error', 'Error al crear registro de inventario', 'error');
    }
  });
}
getEstadoStock(stock: number): string {
  if (stock === 0) return 'Sin stock';
  if (stock <= 5) return 'Stock bajo';
  return 'Stock suficiente';
}

getEstadoClass(stock: number): string {
  if (stock === 0) return 'estado-critico';
  if (stock <= 5) return 'estado-bajo';
  return 'estado-normal';
}



  editarItem(item: any) {
    this.editandoItem = { ...item };
  }

  guardarEdicion() {
    if (!this.validarCampos(this.editandoItem)) return;

    this.inventarioService.editarInventario(this.editandoItem.Id_Inventario, this.editandoItem).subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.mostrarModal('Éxito', 'Registro de inventario actualizado correctamente', 'success', () => {
            this.cargarInventario();
            this.editandoItem = null;
          }, false);
        } else {
          this.mostrarModal('Error', res.message, 'error');
        }
      },
      error: () => {
        this.mostrarModal('Error', 'Error al editar registro de inventario', 'error');
      }
    });
  }

  cancelarEdicion() {
    this.editandoItem = null;
  }

  confirmarEliminar(id: number) {
    this.mostrarModal('Confirmar eliminación', '¿Estás seguro de que quieres eliminar este registro de inventario?', 'warning', () => {
      this.eliminarItem(id);
    }, true);
  }

  eliminarItem(id: number) {
    this.inventarioService.eliminarInventario(id).subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.mostrarModal('Éxito', 'Registro de inventario eliminado correctamente', 'success', () => {
            this.cargarInventario();
          }, false);
        } else {
          this.mostrarModal('Error', res.message, 'error');
        }
      },
      error: () => {
        this.mostrarModal('Error', 'Error al eliminar registro de inventario', 'error');
      }
    });
  }
}