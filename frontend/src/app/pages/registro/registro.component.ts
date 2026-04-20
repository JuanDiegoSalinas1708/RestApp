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
    edad: 0
  };
  cargando = false;

  // Fecha de nacimiento y edad
  fechaNacimiento = '';
  edad: number | null = null;
  fechaMaxima: string = '';

  // Validaciones de contraseña
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
  ) {
    // Calcular fecha máxima (18 años atrás desde hoy)
    const hoy = new Date();
    const fechaMax = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate());
    this.fechaMaxima = fechaMax.toISOString().split('T')[0];
  }

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

  calcularEdad() {
    if (this.fechaNacimiento) {
      const hoy = new Date();
      const nacimiento = new Date(this.fechaNacimiento);
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }
      this.edad = edad;
      
      if (edad < 18) {
        this.mostrarModal('Edad no permitida', 'Debes ser mayor de 18 años para registrarte.', 'warning');
        this.fechaNacimiento = '';
        this.edad = null;
      }
    }
  }

  validarPassword(password: string) {
    this.passwordRequerimientos.minLength = password.length >= 8;
    this.passwordRequerimientos.mayuscula = /[A-Z]/.test(password);
    this.passwordRequerimientos.minuscula = /[a-z]/.test(password);
    this.passwordRequerimientos.numero = /[0-9]/.test(password);
    this.passwordRequerimientos.especial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const requisitos = [
      this.passwordRequerimientos.minLength,
      this.passwordRequerimientos.mayuscula,
      this.passwordRequerimientos.minuscula,
      this.passwordRequerimientos.numero,
      this.passwordRequerimientos.especial
    ];
    
    const cumplidos = requisitos.filter(r => r === true).length;
    this.fortalezaPassword = (cumplidos / 5) * 100;

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
    if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.apellido || !this.nuevoUsuario.correo || !this.nuevoUsuario.password || !this.fechaNacimiento) {
      this.mostrarModal('Campos incompletos', 'Por favor complete todos los campos.', 'warning');
      return;
    }

    // Validar edad
    if (!this.edad || this.edad < 18) {
      this.mostrarModal('Edad no permitida', 'Debes ser mayor de 18 años para registrarte.', 'warning');
      return;
    }

    // Validar contraseña segura
    if (!this.passwordEsValida()) {
      this.mostrarModal('Contraseña débil', 'La contraseña debe cumplir con todos los requisitos de seguridad.', 'warning');
      return;
    }

    // Asignar edad al usuario
    this.nuevoUsuario.edad = this.edad;

    this.cargando = true;
    this.authService.registro(this.nuevoUsuario).subscribe({
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