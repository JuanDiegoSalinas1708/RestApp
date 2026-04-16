import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-verificar',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalComponent],
  templateUrl: './verificar.component.html',
  styleUrls: ['./verificar.component.css']
})
export class VerificarComponent implements OnInit {
  cargando = true;
  mensaje = '';
  error = false;

  modalVisible = false;
  modalTitulo = '';
  modalMensaje = '';
  modalTipo: 'success' | 'error' | 'warning' | 'info' = 'info';
  modalAccionConfirmar: () => void = () => {};

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token');
    if (token) {
      this.authService.verificarEmail(token).subscribe({
        next: (res: any) => {
          this.cargando = false;
          if (res.status === 'ok') {
            this.mostrarModal('¡Éxito!', res.message, 'success', () => {
              this.router.navigate(['/login']);
            });
          } else {
            this.mostrarModal('Error', res.message, 'error', () => {
              this.router.navigate(['/login']);
            });
          }
        },
        error: (err: any) => {
          this.cargando = false;
          this.mostrarModal('Error', err.error?.message || 'Error al verificar email', 'error', () => {
            this.router.navigate(['/login']);
          });
        }
      });
    } else {
      this.cargando = false;
      this.mostrarModal('Error', 'Token no válido', 'error', () => {
        this.router.navigate(['/login']);
      });
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
}