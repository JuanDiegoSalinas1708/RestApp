import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-recuperar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ModalComponent],
  templateUrl: './recuperar.component.html',
  styleUrls: ['./recuperar.component.css']
})
export class RecuperarComponent {
  correo = '';
  nuevaPassword = '';
  confirmarPassword = '';
  cargando = false;

  modalVisible = false;
  modalTitulo = '';
  modalMensaje = '';
  modalTipo: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalAccionConfirmar: () => void = () => {};

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  mostrarModal(titulo: string, mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info' = 'info', onConfirm?: () => void) {
    this.modalTitulo = titulo;
    this.modalMensaje = mensaje;
    this.modalTipo = tipo;
    this.modalAccionConfirmar = onConfirm || (() => this.cerrarModal());
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

  onSubmit() {
    if (!this.correo || !this.nuevaPassword || !this.confirmarPassword) {
      this.mostrarModal('Campos incompletos', 'Por favor complete todos los campos.', 'warning');
      return;
    }

    if (this.nuevaPassword !== this.confirmarPassword) {
      this.mostrarModal('Contraseñas no coinciden', 'Las contraseñas no coinciden.', 'warning');
      return;
    }

    if (this.nuevaPassword.length < 8) {
      this.mostrarModal('Contraseña débil', 'La contraseña debe tener al menos 8 caracteres.', 'warning');
      return;
    }

    this.cargando = true;
    this.authService.recuperarPassword(this.correo, this.nuevaPassword).subscribe({
      next: (res: any) => {
        this.cargando = false;
        if (res.status === 'ok') {
          this.mostrarModal('Éxito', res.message, 'success', () => {
            this.router.navigate(['/login']);
          });
        } else {
          this.mostrarModal('Error', res.message, 'error');
        }
      },
      error: (err: any) => {
        this.cargando = false;
        this.mostrarModal('Error', err.error?.message || 'Error al recuperar contraseña', 'error');
      }
    });
  }
}