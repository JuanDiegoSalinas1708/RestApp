import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrdenesService } from '../../services/ordenes.service';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-ordenes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ordenes.component.html',
  styleUrls: ['./ordenes.component.css']
})
export class OrdenesComponent implements OnInit {
  ordenes: any[] = [];
  usuarios: any[] = [];
  usuario: any = null;
  nuevaOrden: any = { Estado: '', Fecha: '', Id_Usuario: '' };
  editandoOrden: any = null;

  constructor(
    private ordenesService: OrdenesService,
    private usuariosService: UsuariosService,
    private router: Router
  ) {}

  ngOnInit() {
    const u = localStorage.getItem('usuario');
    if (!u) {
      this.router.navigate(['/login']);
      return;
    }
    this.usuario = JSON.parse(u);
    this.cargarUsuarios();
    this.cargarOrdenes();
  }

  cargarUsuarios() {
    this.usuariosService.getUsuarios().subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.usuarios = res.data;
        }
      },
      error: () => {
        console.error('Error al cargar usuarios');
      }
    });
  }

  cargarOrdenes() {
    this.ordenesService.getOrdenes().subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.ordenes = res.data;
        }
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }

  obtenerNombreUsuario(idUsuario: number): string {
    const usuario = this.usuarios.find(u => u.Id_Usuario === idUsuario);
    return usuario ? `${usuario.Nombre} ${usuario.Apellido}` : 'Usuario no encontrado';
  }

  crearOrden() {
    if (!this.nuevaOrden.Estado || !this.nuevaOrden.Fecha || !this.nuevaOrden.Id_Usuario) {
      alert('Todos los campos son obligatorios.');
      return;
    }

    this.ordenesService.crearOrden(this.nuevaOrden).subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.cargarOrdenes();
          this.nuevaOrden = { Estado: '', Fecha: '', Id_Usuario: '' };
        } else {
          alert(res.message);
        }
      },
      error: () => {
        alert('Error al crear orden.');
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
    if (!this.editandoOrden.Estado || !this.editandoOrden.Fecha || !this.editandoOrden.Id_Usuario) {
      alert('Todos los campos son obligatorios.');
      return;
    }

    this.ordenesService.editarOrden(this.editandoOrden.Id_Orden, this.editandoOrden).subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.cargarOrdenes();
          this.editandoOrden = null;
        } else {
          alert(res.message);
        }
      },
      error: () => {
        alert('Error al editar orden.');
      }
    });
  }

  cancelarEdicion() {
    this.editandoOrden = null;
  }

  eliminarOrden(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar esta orden?')) {
      this.ordenesService.eliminarOrden(id).subscribe({
        next: (res) => {
          if (res.status === 'ok') {
            this.cargarOrdenes();
          } else {
            alert(res.message);
          }
        },
        error: () => {
          alert('Error al eliminar orden.');
        }
      });
    }
  }

  getEstadoClass(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'pendiente': return 'estado-pendiente';
      case 'pagado': return 'estado-pagado';
      case 'enviado': return 'estado-enviado';
      default: return '';
    }
  }
}