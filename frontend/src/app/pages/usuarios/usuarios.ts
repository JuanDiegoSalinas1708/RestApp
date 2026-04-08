import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { UsuariosService } from '../../services/usuarios.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios implements OnInit {
  usuarios: any[] = [];
  usuario: any = null;
  editandoUsuario: any = null;

  constructor(private usuariosService: UsuariosService, private router: Router) {}

  ngOnInit() {
    const u = localStorage.getItem('usuario');
    if (!u) {
      this.router.navigate(['/login']);
      return;
    }
    this.usuario = JSON.parse(u);
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuariosService.getUsuarios().subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.usuarios = res.data;
        }
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }

  editarUsuario(user: any) {
    this.editandoUsuario = { ...user };
  }

  guardarEdicion() {
    if (!this.editandoUsuario.nombre || !this.editandoUsuario.apellido || !this.editandoUsuario.correo || !this.editandoUsuario.edad) {
      alert('Todos los campos son obligatorios.');
      return;
    }
    this.usuariosService.editarUsuario(this.editandoUsuario.id, this.editandoUsuario).subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.cargarUsuarios();
          this.editandoUsuario = null;
        } else {
          alert(res.message);
        }
      },
      error: (err) => {
        alert('Error al editar usuario.');
      }
    });
  }

  cancelarEdicion() {
    this.editandoUsuario = null;
  }

  eliminarUsuario(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      this.usuariosService.eliminarUsuario(id).subscribe({
        next: (res) => {
          if (res.status === 'ok') {
            this.cargarUsuarios();
          } else {
            alert(res.message);
          }
        },
        error: (err) => {
          alert('Error al eliminar usuario.');
        }
      });
    }
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}
