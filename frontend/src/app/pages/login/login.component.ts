import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../services/auth.service";
import { ModalComponent } from "../modal/modal.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ModalComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credenciales = {
    correo: '',
    password: ''
  };
  cargando = false;
  recordar = false;

  bloqueado = false;
  tiempoRestante = 0;
  intervalo: any = null;

  modalVisible = false;
  modalTitulo = '';
  modalMensaje = '';
  modalTipo: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalAccionConfirmar: () => void = () => {};

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnDestroy() {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
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

  iniciarContador(segundos: number) {
    this.bloqueado = true;
    this.tiempoRestante = segundos;

    this.intervalo = setInterval(() => {
      this.tiempoRestante--;
      if (this.tiempoRestante <= 0) {
        clearInterval(this.intervalo);
        this.bloqueado = false;
        this.intervalo = null;
      }
    }, 1000);
  }

  onSubmit() {
    if (this.bloqueado) {
      this.mostrarModal('Cuenta bloqueada', `Espera ${this.tiempoRestante} segundos para intentar nuevamente.`, 'warning');
      return;
    }

    if (!this.credenciales.correo || !this.credenciales.password) {
      this.mostrarModal('Campos incompletos', 'Por favor ingrese correo y contraseña.', 'warning');
      return;
    }

    this.cargando = true;
    this.authService.login(this.credenciales.correo, this.credenciales.password).subscribe({
      next: (res: any) => {
        this.cargando = false;
        if (res.status === 'ok') {
          if (this.recordar) {
            localStorage.setItem('usuario', JSON.stringify(res.usuario));
          } else {
            sessionStorage.setItem('usuario', JSON.stringify(res.usuario));
          }
          this.router.navigate(['/home']);
        } else {
          this.mostrarModal('Error', res.message, 'error');
        }
      },
      error: (err: any) => {
        this.cargando = false;
        console.log('ERROR COMPLETO:', err);
        console.log('RESPUESTA:', err.error);
        
        let mensaje = 'Error al iniciar sesión';
        
        if (err.error && err.error.message) {
          mensaje = err.error.message;
          console.log('MENSAJE DEL BACKEND:', mensaje);
        }
        
        // Verificar si es un mensaje de bloqueo
        if (mensaje.includes('bloqueada') || mensaje.includes('segundos')) {
          const match = mensaje.match(/(\d+)\s*segundos?/);
          if (match) {
            this.iniciarContador(parseInt(match[1]));
          }
        }
        
        this.mostrarModal('Error de inicio de sesión', mensaje, 'error');
      }
    });
  }
}