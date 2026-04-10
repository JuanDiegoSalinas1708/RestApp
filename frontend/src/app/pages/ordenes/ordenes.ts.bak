import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { OrdenesService } from '../../services/ordenes.service';
import { UsuariosService } from '../../services/usuarios.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ordenes',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './ordenes.html',
  styleUrl: './ordenes.css',
})
export class Ordenes implements OnInit {
  ordenes: any[] = [];
  usuarios: any[] = [];
  usuario: any = null;
  nuevaOrden: any = { estado: '', fecha: '', id_usuario: '' };
  editandoOrden: any = null;

  constructor(private ordenesService: OrdenesService, private usuariosService: UsuariosService, private router: Router) {}

  ngOnInit() {
    const u = localStorage.getItem('usuario');
    if (!u) {
      this.router.navigate(['/login']);
      return;
    }
    this.usuario = JSON.parse(u);
    this.cargarOrdenes();
    this.cargarUsuarios();
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

  cargarUsuarios() {
    this.usuariosService.getUsuarios().subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.usuarios = res.data;
        }
      }
    });
  }

  crearOrden() {
    if (!this.nuevaOrden.estado || !this.nuevaOrden.fecha || !this.nuevaOrden.id_usuario) {
      alert('Todos los campos son obligatorios.');
      return;
    }
    this.ordenesService.crearOrden(this.nuevaOrden).subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.cargarOrdenes();
          this.nuevaOrden = { estado: '', fecha: '', id_usuario: '' };
        } else {
          alert(res.message);
        }
      },
      error: (err) => {
        alert('Error al crear orden.');
      }
    });
  }

  editarOrden(ord: any) {
    this.editandoOrden = { ...ord };
  }

  guardarEdicion() {
    if (!this.editandoOrden.estado || !this.editandoOrden.fecha || !this.editandoOrden.id_usuario) {
      alert('Todos los campos son obligatorios.');
      return;
    }
    this.ordenesService.editarOrden(this.editandoOrden.id, this.editandoOrden).subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.cargarOrdenes();
          this.editandoOrden = null;
        } else {
          alert(res.message);
        }
      },
      error: (err) => {
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
        error: (err) => {
          alert('Error al eliminar orden.');
        }
      });
    }
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}
