import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];
  usuarioActual: any = null;
  nuevoUsuario: any = { Nombre: '', Apellido: '', Correo: '', Password: '', Edad: '' };
  editandoUsuario: any = null;

  // Modal
  modalVisible = false;
  modalTitulo = '';
  modalMensaje = '';
  modalTipo: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalAccionConfirmar: () => void = () => {};
  modalMostrarCancelar = true;

  constructor(
    private usuariosService: UsuariosService,
    private router: Router
  ) {}

  ngOnInit() {
    const data = localStorage.getItem('usuario') ?? sessionStorage.getItem('usuario');
    if (!data) {
      this.router.navigate(['/login']);
      return;
    }
    this.usuarioActual = JSON.parse(data);
    this.cargarUsuarios();
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
    console.log('Cargando usuarios...');
    this.usuariosService.getUsuarios().subscribe({
      next: (res) => {
        console.log('Respuesta usuarios:', res);
        if (res.status === 'ok') {
          this.usuarios = res.data;
        }
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.mostrarModal('Error', 'Error al cargar usuarios', 'error');
      }
    });
  }

  validarCampos(usuario: any, esCreacion: boolean = true): boolean {
    if (!usuario.Nombre || usuario.Nombre.trim() === '') {
      this.mostrarModal('Campos incompletos', 'El nombre es obligatorio.', 'warning');
      return false;
    }
    if (!usuario.Apellido || usuario.Apellido.trim() === '') {
      this.mostrarModal('Campos incompletos', 'El apellido es obligatorio.', 'warning');
      return false;
    }
    if (!usuario.Correo || usuario.Correo.trim() === '') {
      this.mostrarModal('Campos incompletos', 'El correo es obligatorio.', 'warning');
      return false;
    }
    if (!usuario.Edad || usuario.Edad <= 0) {
      this.mostrarModal('Campos inválidos', 'La edad debe ser mayor a 0.', 'warning');
      return false;
    }
    if (esCreacion && (!usuario.Password || usuario.Password.trim() === '')) {
      this.mostrarModal('Campos incompletos', 'La contraseña es obligatoria.', 'warning');
      return false;
    }
    return true;
  }

  crearUsuario() {
    if (!this.validarCampos(this.nuevoUsuario, true)) return;

    console.log('Creando usuario:', this.nuevoUsuario);
    this.usuariosService.crearUsuario(this.nuevoUsuario).subscribe({
      next: (res) => {
        console.log('Respuesta crear:', res);
        if (res.status === 'ok') {
          this.mostrarModal('Éxito', 'Usuario creado correctamente', 'success', () => {
            this.cargarUsuarios();
            this.nuevoUsuario = { Nombre: '', Apellido: '', Correo: '', Password: '', Edad: '' };
          }, false);
        } else {
          this.mostrarModal('Error', res.message, 'error');
        }
      },
      error: (err) => {
        console.error('Error crear:', err);
        this.mostrarModal('Error', 'Error al crear usuario', 'error');
      }
    });
  }

  editarUsuario(usuario: any) {
    this.editandoUsuario = { ...usuario };
    this.editandoUsuario.Password = ''; // Limpiar password por seguridad
  }

  guardarEdicion() {
    if (!this.validarCampos(this.editandoUsuario, false)) return;

    // Si el password está vacío, no lo enviamos
    const datosEnviar = { ...this.editandoUsuario };
    if (!datosEnviar.Password || datosEnviar.Password.trim() === '') {
      delete datosEnviar.Password;
    }

    this.usuariosService.editarUsuario(this.editandoUsuario.Id_Usuario, datosEnviar).subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.mostrarModal('Éxito', 'Usuario actualizado correctamente', 'success', () => {
            this.cargarUsuarios();
            this.editandoUsuario = null;
          }, false);
        } else {
          this.mostrarModal('Error', res.message, 'error');
        }
      },
      error: () => {
        this.mostrarModal('Error', 'Error al editar usuario', 'error');
      }
    });
  }

  cancelarEdicion() {
    this.editandoUsuario = null;
  }

  confirmarEliminar(id: number) {
    this.mostrarModal('Confirmar eliminación', '¿Estás seguro de que quieres eliminar este usuario?', 'warning', () => {
      this.eliminarUsuario(id);
    }, true);
  }

  eliminarUsuario(id: number) {
    this.usuariosService.eliminarUsuario(id).subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.mostrarModal('Éxito', 'Usuario eliminado correctamente', 'success', () => {
            this.cargarUsuarios();
          }, false);
        } else {
          this.mostrarModal('Error', res.message, 'error');
        }
      },
      error: () => {
        this.mostrarModal('Error', 'Error al eliminar usuario', 'error');
      }
    });
  }

  toggleEstado(usuario: any) {
    const nuevoEstado = usuario.Estado === 1 ? 0 : 1;
    this.usuariosService.editarUsuario(usuario.Id_Usuario, { Estado: nuevoEstado }).subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          usuario.Estado = nuevoEstado;
          this.mostrarModal('Éxito', `Usuario ${nuevoEstado === 1 ? 'activado' : 'desactivado'} correctamente`, 'success', undefined, false);
        } else {
          this.mostrarModal('Error', res.message, 'error');
        }
      },
      error: () => {
        this.mostrarModal('Error', 'Error al cambiar estado del usuario', 'error');
      }
    });
  }
}