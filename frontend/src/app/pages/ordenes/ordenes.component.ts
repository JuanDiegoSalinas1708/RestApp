import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrdenesService } from '../../services/ordenes.service';
import { UsuariosService } from '../../services/usuarios.service';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-ordenes',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './ordenes.component.html',
  styleUrls: ['./ordenes.component.css']
})
export class OrdenesComponent implements OnInit {
  ordenes: any[] = [];
  usuarios: any[] = [];
  usuario: any = null;
  nuevaOrden: any = { Estado: '', Fecha: '', Id_Usuario: '' };
  editandoOrden: any = null;

  // Modal
  modalVisible = false;
  modalTitulo = '';
  modalMensaje = '';
  modalTipo: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalAccionConfirmar: () => void = () => {};
  modalMostrarCancelar = true;

  estados = ['Pendiente', 'Pagado', 'Enviado'];

  constructor(
    private ordenesService: OrdenesService,
    private usuariosService: UsuariosService,
    private router: Router
  ) {}

  
ngOnInit() {
    const data = localStorage.getItem('usuario') ?? sessionStorage.getItem('usuario');
    if (!data) {
      this.router.navigate(['/login']);
      return;
    }
    this.usuario = JSON.parse(data);
    this.cargarUsuarios();
    this.cargarOrdenes();
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

  cargarUsuarios() {
    this.usuariosService.getUsuarios().subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.usuarios = res.data;
        }
      },
      error: () => {
        this.mostrarModal('Error', 'Error al cargar usuarios', 'error');
      }
    });
  }

  cargarOrdenes() {
    console.log('Cargando órdenes...');
    this.ordenesService.getOrdenes().subscribe({
      next: (res) => {
        console.log('Respuesta órdenes:', res);
        if (res.status === 'ok') {
          this.ordenes = res.data;
        }
      },
      error: (err) => {
        console.error('Error al cargar órdenes:', err);
        this.mostrarModal('Error', 'Error al cargar órdenes', 'error');
      }
    });
  }

  obtenerNombreUsuario(idUsuario: number): string {
    const usuario = this.usuarios.find(u => u.Id_Usuario === idUsuario);
    return usuario ? `${usuario.Nombre} ${usuario.Apellido}` : 'Usuario no encontrado';
  }

  getEstadoClass(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'pendiente': return 'estado-pendiente';
      case 'pagado': return 'estado-pagado';
      case 'enviado': return 'estado-enviado';
      default: return '';
    }
  }

  validarCampos(orden: any): boolean {
    if (!orden.Estado) {
      this.mostrarModal('Campos incompletos', 'Debes seleccionar un estado.', 'warning');
      return false;
    }
    if (!orden.Fecha) {
      this.mostrarModal('Campos incompletos', 'Debes seleccionar una fecha.', 'warning');
      return false;
    }
    if (!orden.Id_Usuario) {
      this.mostrarModal('Campos incompletos', 'Debes seleccionar un usuario.', 'warning');
      return false;
    }
    return true;
  }

  crearOrden() {
    if (!this.validarCampos(this.nuevaOrden)) return;

    console.log('Creando orden:', this.nuevaOrden);
    this.ordenesService.crearOrden(this.nuevaOrden).subscribe({
      next: (res) => {
        console.log('Respuesta crear:', res);
        if (res.status === 'ok') {
          this.mostrarModal('Éxito', 'Orden creada correctamente', 'success', () => {
            this.cargarOrdenes();
            this.nuevaOrden = { Estado: '', Fecha: '', Id_Usuario: '' };
          }, false);
        } else {
          this.mostrarModal('Error', res.message, 'error');
        }
      },
      error: (err) => {
        console.error('Error crear:', err);
        this.mostrarModal('Error', 'Error al crear orden', 'error');
      }
    });
  }

  editarOrden(orden: any) {
    this.editandoOrden = { ...orden };
    // Formatear fecha para el input date
    if (this.editandoOrden.Fecha) {
      this.editandoOrden.Fecha = this.editandoOrden.Fecha.split('T')[0];
    }
  }

  guardarEdicion() {
    if (!this.validarCampos(this.editandoOrden)) return;

    this.ordenesService.editarOrden(this.editandoOrden.Id_Orden, this.editandoOrden).subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.mostrarModal('Éxito', 'Orden actualizada correctamente', 'success', () => {
            this.cargarOrdenes();
            this.editandoOrden = null;
          }, false);
        } else {
          this.mostrarModal('Error', res.message, 'error');
        }
      },
      error: () => {
        this.mostrarModal('Error', 'Error al editar orden', 'error');
      }
    });
  }

  cancelarEdicion() {
    this.editandoOrden = null;
  }

  confirmarEliminar(id: number) {
    this.mostrarModal('Confirmar eliminación', '¿Estás seguro de que quieres eliminar esta orden?', 'warning', () => {
      this.eliminarOrden(id);
    }, true);
  }

  eliminarOrden(id: number) {
    this.ordenesService.eliminarOrden(id).subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.mostrarModal('Éxito', 'Orden eliminada correctamente', 'success', () => {
            this.cargarOrdenes();
          }, false);
        } else {
          this.mostrarModal('Error', res.message, 'error');
        }
      },
      error: () => {
        this.mostrarModal('Error', 'Error al eliminar orden', 'error');
      }
    });
  }
}