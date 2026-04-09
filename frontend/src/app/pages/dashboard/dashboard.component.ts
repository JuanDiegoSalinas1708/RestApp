import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProductosService } from '../../services/productos.service';
import { InventarioService } from '../../services/inventario.services';
import { OrdenesService } from '../../services/ordenes.service';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Datos de resumen
  totalProductos: number = 0;
  totalInventario: number = 0;
  totalOrdenes: number = 0;
  totalUsuarios: number = 0;
  
  // Últimas órdenes
  ultimasOrdenes: any[] = [];
  
  // Productos con bajo stock
  productosBajoStock: any[] = [];
  
  // Estadísticas de órdenes por estado
  ordenesPendientes: number = 0;
  ordenesPagadas: number = 0;
  ordenesEnviadas: number = 0;
  
  // Loading states
  cargando: boolean = true;

  constructor(
    private productosService: ProductosService,
    private inventarioService: InventarioService,
    private ordenesService: OrdenesService,
    private usuariosService: UsuariosService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarDashboard();
  }

  cargarDashboard() {
    this.cargando = true;
    
    // Cargar productos
    this.productosService.getProductos().subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.totalProductos = res.data.length;
        }
      },
      error: () => console.error('Error cargando productos')
    });

    // Cargar inventario
    this.inventarioService.getInventario().subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.totalInventario = res.data.length;
          // Filtrar productos con stock bajo (< 5)
          this.productosBajoStock = res.data.filter((item: any) => item.Stock < 5);
        }
      },
      error: () => console.error('Error cargando inventario')
    });

    // Cargar órdenes
    this.ordenesService.getOrdenes().subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.totalOrdenes = res.data.length;
          this.ultimasOrdenes = res.data.slice(-5).reverse();
          
          // Contar por estado
          this.ordenesPendientes = res.data.filter((o: any) => o.Estado === 'Pendiente').length;
          this.ordenesPagadas = res.data.filter((o: any) => o.Estado === 'Pagado').length;
          this.ordenesEnviadas = res.data.filter((o: any) => o.Estado === 'Enviado').length;
        }
        this.cargando = false;
      },
      error: () => {
        console.error('Error cargando órdenes');
        this.cargando = false;
      }
    });

    // Cargar usuarios
    this.usuariosService.getUsuarios().subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.totalUsuarios = res.data.length;
        }
      },
      error: () => console.error('Error cargando usuarios')
    });
  }

  irAModulo(ruta: string) {
    this.router.navigate([ruta]);
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