import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ModalComponent],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {
  nuevoUsuario = {
    nombre: '',
    apellido: '',
    correo: '',
    password: '',
    fechaNacimiento: ''
  };
  fechaMaxima: string = new Date().toISOString().split('T')[0];

  cargando = false;

  // Requisitos de contraseña
  passwordRequerimientos = {
    minLength: false,
    mayuscula: false,
    minuscula: false,
    numero: false,
    especial: false
  };

  // Barra de progreso
  fortalezaPassword: number = 0;
  textoFortaleza: string = '';
  claseFortaleza: string = '';

  // Modal
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

  validarPassword(password: string) {
    // Actualizar requisitos
    this.passwordRequerimientos.minLength = password.length >= 8;
    this.passwordRequerimientos.mayuscula = /[A-Z]/.test(password);
    this.passwordRequerimientos.minuscula = /[a-z]/.test(password);
    this.passwordRequerimientos.numero = /[0-9]/.test(password);
    this.passwordRequerimientos.especial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // Calcular fortaleza (0-100)
    const requisitos = [
      this.passwordRequerimientos.minLength,
      this.passwordRequerimientos.mayuscula,
      this.passwordRequerimientos.minuscula,
      this.passwordRequerimientos.numero,
      this.passwordRequerimientos.especial
    ];
    
    const cumplidos = requisitos.filter(r => r === true).length;
    this.fortalezaPassword = (cumplidos / 5) * 100;

    // Texto y color según fortaleza
    if (password.length === 0) {
      this.textoFortaleza = '';
      this.claseFortaleza = '';
    } else if (this.fortalezaPassword <= 20) {
      this.textoFortaleza = 'Muy débil';
      this.claseFortaleza = 'muy-debil';
    } else if (this.fortalezaPassword <= 40) {
      this.textoFortaleza = 'Débil';
      this.claseFortaleza = 'debil';
    } else if (this.fortalezaPassword <= 60) {
      this.textoFortaleza = 'Regular';
      this.claseFortaleza = 'regular';
    } else if (this.fortalezaPassword <= 80) {
      this.textoFortaleza = 'Fuerte';
      this.claseFortaleza = 'fuerte';
    } else {
      this.textoFortaleza = 'Muy fuerte';
      this.claseFortaleza = 'muy-fuerte';
    }
  }

  passwordEsValida(): boolean {
    return this.passwordRequerimientos.minLength &&
           this.passwordRequerimientos.mayuscula &&
           this.passwordRequerimientos.minuscula &&
           this.passwordRequerimientos.numero &&
           this.passwordRequerimientos.especial;
  }

  onSubmit() {
    // Validar campos obligatorios
    if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.apellido || !this.nuevoUsuario.correo || !this.nuevoUsuario.password || !this.nuevoUsuario.fechaNacimiento) {
      this.mostrarModal('Campos incompletos', 'Por favor complete todos los campos.', 'warning');
      return;
    }

    // Validar edad
    const hoy = new Date();
    const nacimiento = new Date(this.nuevoUsuario.fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    if (edad < 18) {
      this.mostrarModal('Edad no permitida', 'Debes tener al menos 18 años para registrarte.', 'warning');
      return;
    }

    // Validar contraseña segura
    if (!this.passwordEsValida()) {
      this.mostrarModal('Contraseña débil', 'La contraseña debe cumplir con todos los requisitos de seguridad.', 'warning');
      return;
    }

    this.cargando = true;
    const payload = {
      ...this.nuevoUsuario,
      fechadenacimiento: this.nuevoUsuario.fechaNacimiento
    };

    this.authService.registro(payload).subscribe({
      next: (res: any) => {
        this.cargando = false;
        if (res.status === 'ok') {
          this.mostrarModal('Registro exitoso', 'Cuenta creada correctamente. Por favor inicia sesión.', 'success', () => {
            this.router.navigate(['/login']);
          });
        } else {
          this.mostrarModal('Error', res.message, 'error');
        }
      },
      error: (err: any) => {
        this.cargando = false;
        this.mostrarModal('Error', err.error?.message || 'Error al registrarse', 'error');
      }
    });
  }
}