import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
 template: `
  <div class="modal-overlay" *ngIf="visible" (click)="cerrar()">
    <div class="modal-container" (click)="$event.stopPropagation()">
      <div class="modal-header" [class]="tipo">
        <span class="modal-icon">{{ icono }}</span>
        <h3>{{ titulo }}</h3>
        <button class="modal-close" (click)="cerrar()">✕</button>
      </div>
      <div class="modal-body">
        <ng-content></ng-content>
        <p *ngIf="!mensajePersonalizado">{{ mensaje }}</p>
      </div>
      <div class="modal-footer">
        <button *ngIf="mostrarCancelar" class="btn-cancelar" (click)="cancelar()">{{ textoCancelar }}</button>
        <button class="btn-confirmar" [class]="tipo" (click)="confirmar()">{{ textoConfirmar }}</button>
      </div>
    </div>
  </div>
`,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease;
    }

    .modal-container {
      background: white;
      border-radius: 16px;
      width: 90%;
      max-width: 420px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      animation: slideIn 0.3s ease;
    }

    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid #eef2f6;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .modal-header.success { background: #e8f5e9; border-radius: 16px 16px 0 0; }
    .modal-header.error { background: #ffebee; border-radius: 16px 16px 0 0; }
    .modal-header.warning { background: #fff3e0; border-radius: 16px 16px 0 0; }
    .modal-header.info { background: #e3f2fd; border-radius: 16px 16px 0 0; }

    .modal-icon { font-size: 28px; }
    .modal-header h3 { margin: 0; font-size: 18px; color: #1e2a3a; flex: 1; }
    .modal-close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #9aa6b5;
      transition: color 0.2s;
    }
    .modal-close:hover { color: #1e2a3a; }

    .modal-body { padding: 24px; }
    .modal-body p { margin: 0; color: #4a5568; line-height: 1.5; }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid #eef2f6;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .btn-confirmar, .btn-cancelar {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-cancelar {
      background: #f0f2f5;
      color: #4a5568;
    }
    .btn-cancelar:hover { background: #e4e7ec; }

    .btn-confirmar {
      background: #1a6fbd;
      color: white;
    }
    .btn-confirmar.success { background: #27ae60; }
    .btn-confirmar.error { background: #e74c3c; }
    .btn-confirmar.warning { background: #e67e22; }
    .btn-confirmar:hover { transform: translateY(-1px); filter: brightness(105%); }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class ModalComponent {
  @Input() visible = false;
  @Input() titulo = '';
  @Input() mensaje = '';
  @Input() tipo: 'success' | 'error' | 'warning' | 'info' = 'info';
  @Input() mostrarCancelar = true;
  @Input() textoConfirmar = 'Aceptar';
  @Input() textoCancelar = 'Cancelar';
  
  @Output() confirmado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  get icono(): string {
    const iconos = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return iconos[this.tipo];
  }

  get mensajePersonalizado():boolean{
    return !this.mensaje || this.mensaje.length === 0;
  }

  cerrar() {
    this.cancelado.emit();
  }

  confirmar() {
    this.confirmado.emit();
  }

  cancelar() {
    this.cancelado.emit();
  }
}