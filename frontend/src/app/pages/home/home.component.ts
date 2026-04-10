import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  usuario: any = null;
  menuAbierto = true;

  menuItems = [
    { label: 'Dashboard',     icon: '⊞',  ruta: '/home/dashboard'  },
    { label: 'Productos',     icon: '📦',  ruta: '/home/productos'  },
    { label: 'Inventario',    icon: '🗄️',  ruta: '/home/inventario' },
    { label: 'Órdenes',       icon: '📋',  ruta: '/home/ordenes'    },
    { label: 'Detalle Orden', icon: '🔍',  ruta: '/home/detalle-orden'    },
    { label: 'Usuarios',      icon: '👤',  ruta: '/home/usuarios'   },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    const data = this.obtenerUsuarioAlmacenado();
    if (data) {
      this.usuario = JSON.parse(data);
    } else {
      this.router.navigate(['/login']);
    }
  }

  private obtenerUsuarioAlmacenado(): string | null {
    return localStorage.getItem('usuario') ?? sessionStorage.getItem('usuario');
  }

  // Muestra las cards solo si estás exactamente en /home
  esHome(): boolean {
    return this.router.url === '/home';
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('rememberMe');
    sessionStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}