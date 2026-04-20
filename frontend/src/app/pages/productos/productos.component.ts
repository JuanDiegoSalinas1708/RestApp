import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductosService } from '../../services/productos.service';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  productos: any[] = [];
  usuario: any = null;
  nuevoProducto: any = { nombre: '', precio: '', descripcion: '' };
  editandoProducto: any = null;

  modalEdicionVisible=false;
  productoEditando:any=null;

  // Modal
  modalVisible = false;
  modalTitulo = '';
  modalMensaje = '';
  modalTipo: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalAccionConfirmar: () => void = () => {};
  modalMostrarCancelar = true;

  constructor(
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

  abrirModalEdicion(producto:any){
    this.productoEditando = {...producto};
    this.modalEdicionVisible = true;
  }

  cerrarModalEdicion(){
    this.modalEdicionVisible=false;
    this.productoEditando=null;
  }

  guardarEdicionModal(){
    if(!this.productoEditando.nombre|| !this.productoEditando.precio || !this.productoEditando.descripcion){
      this.mostrarModal('Campos incompletos', 'Todos los campos son obligatorios', 'warning');
      return;
    }
    this.productosService.editarProducto(this.productoEditando.id, this.productoEditando).subscribe({
      next: (res) => {
        if(res.status === 'ok'){
          this.mostrarModal('Éxito','Producto actualizado correctamente','success',()=>{
            this.cargarProductos();
            this.cerrarModalEdicion();
          },false);
        } else {
          this.mostrarModal('Error', res.message, 'error');
        }
      },
      error: () =>{
        this.mostrarModal('Error', 'Error al editar producto', 'error');
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

  validarCampos(producto: any): boolean {
    if (!producto.nombre || !producto.precio || !producto.descripcion) {
      this.mostrarModal('Campos incompletos', 'Todos los campos son obligatorios.', 'warning');
      return false;
    }
    if (producto.precio <= 0) {
      this.mostrarModal('Precio inválido', 'El precio debe ser mayor a 0.', 'warning');
      return false;
    }
    return true;
  }

  crearProducto() {
    if (!this.validarCampos(this.nuevoProducto)) return;

    this.productosService.crearProducto(this.nuevoProducto).subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.mostrarModal('Éxito', 'Producto creado correctamente', 'success', () => {
            this.cargarProductos();
            this.nuevoProducto = { nombre: '', precio: '', descripcion: '' };
          }, false);
        } else {
          this.mostrarModal('Error', res.message, 'error');
        }
      },
      error: () => {
        this.mostrarModal('Error', 'Error al crear producto', 'error');
      }
    });
  }

  editarProducto(producto: any) {
    this.editandoProducto = { ...producto };
  }

  guardarEdicion() {
    if (!this.validarCampos(this.editandoProducto)) return;

    this.productosService.editarProducto(this.editandoProducto.id, this.editandoProducto).subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.mostrarModal('Éxito', 'Producto actualizado correctamente', 'success', () => {
            this.cargarProductos();
            this.editandoProducto = null;
          }, false);
        } else {
          this.mostrarModal('Error', res.message, 'error');
        }
      },
      error: () => {
        this.mostrarModal('Error', 'Error al editar producto', 'error');
      }
    });
  }

  cancelarEdicion() {
    this.editandoProducto = null;
  }

  confirmarEliminar(id: number) {
    this.mostrarModal('Confirmar eliminación', '¿Estás seguro de que quieres eliminar este producto?', 'warning', () => {
      this.eliminarProducto(id);
    }, true);
  }

  eliminarProducto(id: number) {
    this.productosService.eliminarProducto(id).subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.mostrarModal('Éxito', 'Producto eliminado correctamente', 'success', () => {
            this.cargarProductos();
          }, false);
        } else {
          this.mostrarModal('Error', res.message, 'error');
        }
      },
      error: () => {
        this.mostrarModal('Error', 'Error al eliminar producto', 'error');
      }
    });
  }
} 