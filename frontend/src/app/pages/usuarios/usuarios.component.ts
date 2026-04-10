import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];
  usuarioActual: any = null;
  nuevoUsuario: any = { Nombre: '', Apellido: '', Correo: '', Password: '', Edad: '' };
  editandoUsuario: any = null;

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

  crearUsuario() {
    if (!this.nuevoUsuario.Nombre || !this.nuevoUsuario.Apellido || !this.nuevoUsuario.Correo || !this.nuevoUsuario.Password || !this.nuevoUsuario.Edad) {
      alert('Todos los campos son obligatorios.');
      return;
    }

    if (this.nuevoUsuario.Edad < 0) {
      alert('La edad no puede ser negativa.');
      return;
    }

    this.usuariosService.crearUsuario(this.nuevoUsuario).subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.cargarUsuarios();
          this.nuevoUsuario = { Nombre: '', Apellido: '', Correo: '', Password: '', Edad: '' };
        } else {
          alert(res.message);
        }
      },
      error: () => {
        alert('Error al crear usuario.');
      }
    });
  }

  editarUsuario(usuario: any) {
    this.editandoUsuario = { ...usuario };
    this.editandoUsuario.Password = ''; // Limpiar password por seguridad
  }

  guardarEdicion() {
    if (!this.editandoUsuario.Nombre || !this.editandoUsuario.Apellido || !this.editandoUsuario.Correo || !this.editandoUsuario.Edad) {
      alert('Nombre, Apellido, Correo y Edad son obligatorios.');
      return;
    }

    // Si el password está vacío, no lo enviamos
    const datosEnviar = { ...this.editandoUsuario };
    if (!datosEnviar.Password) {
      delete datosEnviar.Password;
    }

    this.usuariosService.editarUsuario(this.editandoUsuario.Id_Usuario, datosEnviar).subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.cargarUsuarios();
          this.editandoUsuario = null;
        } else {
          alert(res.message);
        }
      },
      error: () => {
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
        error: () => {
          alert('Error al eliminar usuario.');
        }
      });
    }
  }

  toggleEstado(usuario: any) {
    const nuevoEstado = usuario.Estado === 1 ? 0 : 1;
    this.usuariosService.editarUsuario(usuario.Id_Usuario, { Estado: nuevoEstado }).subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          usuario.Estado = nuevoEstado;
        } else {
          alert(res.message);
        }
      },
      error: () => {
        alert('Error al cambiar estado del usuario.');
      }
    });
  }
}