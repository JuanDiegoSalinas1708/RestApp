import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../services/inventario.services';
import { ProductosService } from '../../services/productos.service';

@Component({
    selector: 'app-inventario',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './inventario.component.html',
    styleUrls: ['./inventario.component.css']
})

export class InventarioComponent implements OnInit {
    inventario: any[] = [];
    productos: any[] = [];
    usuario: any = null;
    nuevoItem: any = { Id_Producto: '', Stock: '' };
    editandoItem: any = null;

    constructor(
        private inventarioService: InventarioService,
        private productosService: ProductosService,
        private router: Router
    ) {}

    ngOnInit() {
        const data = localStorage.getItem('usuario') ?? sessionStorage.getItem('usuario');
        if (!data) {
            this.router.navigate(['/login']);
            return;
        }
        this.usuario = JSON.parse(data);
        this.cargarProductos();
        this.cargarInventario();
    }

    cargarProductos() {
    console.log('🔍 Cargando productos...');  // Debug
    this.productosService.getProductos().subscribe({
        next: (res) => {
            console.log('✅ Respuesta productos:', res);  // Debug
            if (res.status === 'ok') {
                this.productos = res.data;
            }
        },
        error: (err) => {
            console.error('❌ Error productos:', err);  // Debug
        }
    });
}

    cargarInventario() {
    console.log('🔍 Cargando inventario...');  
    this.inventarioService.getInventario().subscribe({
        next: (res) => {
            console.log('✅ Respuesta inventario:', res);  
            if (res.status === 'ok') {
                this.inventario = res.data;
            }
        },
        error: (err) => {
            console.error('❌ Error inventario:', err);  
            console.error('Status:', err.status);  
            console.error('Mensaje:', err.message);  
            
        }
    });
}
    obtenerNombreProducto(idProducto: number): string {
        const producto = this.productos.find(p => p.Id_Producto === idProducto);
        return producto ? producto.Nombre : 'Producto no encontrado';
    }

    crearItem() {
        if (!this.nuevoItem.Id_Producto || !this.nuevoItem.Stock) {
            alert('Todos los campos son obligatorios');
            return;
        }
        if (this.nuevoItem.Stock < 0) {
            alert('El stock no puede ser negativo');
            return;
        }
        this.inventarioService.crearInventario(this.nuevoItem).subscribe({
            next: (res) => {
                if (res.status === 'ok') {
                    this.cargarInventario();
                    this.nuevoItem = { Id_Producto: '', Stock: '' };
                } else {
                    alert(res.message);
                }
            },
            error: () => {
                alert("Error al crear registro de inventario");
            }
        });
    }

    editarItem(item: any) {
        this.editandoItem = { ...item };
    }

    guardarEdicion() {
        if (!this.editandoItem.Id_Producto || !this.editandoItem.Stock) {
            alert('Todos los campos son obligatorios.');
            return;
        }

        if (this.editandoItem.Stock < 0) {
            alert('El stock no puede ser negativo.');
            return;
        }

        this.inventarioService.editarInventario(this.editandoItem.Id_Inventario, this.editandoItem).subscribe({
            next: (res) => {
                if (res.status === 'ok') {
                    this.cargarInventario();
                    this.editandoItem = null;
                } else {
                    alert(res.message);
                }
            },
            error: () => {
                alert('Error al editar registro de inventario.');
            }
        });
    }

    cancelarEdicion() {
        this.editandoItem = null;
    }

    eliminarItem(id: number) {
        if (confirm('¿Estás seguro de que quieres eliminar este registro de inventario?')) {
            this.inventarioService.eliminarInventario(id).subscribe({
                next: (res) => {
                    if (res.status === 'ok') {
                        this.cargarInventario();
                    } else {
                        alert(res.message);
                    }
                },
                error: () => {
                    alert('Error al eliminar registro de inventario.');
                }
            });
        }
    }
}