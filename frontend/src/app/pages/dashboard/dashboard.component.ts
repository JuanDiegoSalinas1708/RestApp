import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProductosService } from '../../services/productos.service';
import { InventarioService } from '../../services/inventario.services';
import { OrdenesService } from '../../services/ordenes.service';
import { UsuariosService } from '../../services/usuarios.service';
import { forkJoin } from 'rxjs';

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

    // Cargar productos e inventario juntos con forkJoin para evitar condiciones de carrera
    forkJoin({
      productos: this.productosService.getProductos(),
      inventario: this.inventarioService.getInventario()
    }).subscribe({
      next: ({ productos, inventario }) => {
        // Productos
        if (productos.status === 'ok') {
          this.totalProductos = productos.data.length;
        }

        // Inventario + cruce con nombre de producto
        if (inventario.status === 'ok') {
          this.totalInventario = inventario.data.length;

          this.productosBajoStock = inventario.data
            .filter((item: any) => item.Stock < 5)
            .map((item: any) => {
              const producto = productos.data.find(
                (p: any) => p.Id_Producto === item.Id_Producto
              );
              return {
                ...item,
                Nombre: producto?.Nombre || 'Sin nombre'
              };
            });
        }
      },
      error: () => console.error('Error cargando productos o inventario')
    });

    // Cargar órdenes
    this.ordenesService.getOrdenes().subscribe({
      next: (res) => {
        if (res.status === 'ok') {
          this.totalOrdenes = res.data.length;
          this.ultimasOrdenes = res.data.slice(-5).reverse();

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