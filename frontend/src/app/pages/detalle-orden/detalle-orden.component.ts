import {Component,OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {DetalleOrdenService} from '../../services/detalle-orden.service';
import {OrdenesService} from '../../services/ordenes.service';
import {ProductosService} from '../../services/productos.service';

@Component({
    selector:'app-detalle-orden',
    standalone:true,
    imports:[CommonModule, FormsModule],
    templateUrl: './detalle-orden.component.html',
    styleUrls:['./detalle-orden.component.css']
})
export class DetalleOrdenComponent implements OnInit{
    detalles:any[]=[];
    ordenes:any[]=[];
    productos:any[]=[];
    usuario:any=null;
    nuevoDetalle: any = {Cantidad: '', Precio: '', Id_Orden: '', Id_Producto: ''};
    editandoDetalle: any = null;

    constructor(
        private detalleOrdenService: DetalleOrdenService,
        private ordenesService:OrdenesService,
        private productosService:ProductosService,
        private router:Router
    ){}
    ngOnInit(){
        const u = localStorage.getItem('usuario');
        if(!u){
            this.router.navigate(['/login']);
            return;
        }
        this.usuario = JSON.parse(u);
        this.cargarOrdenes();
        this.cargarProductos();
        this.cargarDetalles();
    }
    cargarOrdenes(){
        this.ordenesService.getOrdenes().subscribe({
            next:(res) =>{
                if(res.status === 'ok'){
                    this.ordenes = res.data;
                }
            },
            error:()=>{
                console.error('Error al cargar ordenes');
            }
        });
     }
     cargarProductos(){
        this.productosService.getProductos().subscribe({
            next:(res) =>{
                if(res.status === 'ok'){
                    this.productos = res.data;
                }
            },
            error:() =>{
                console.error('Error al cargar productos');
            }
        });
     }
     cargarDetalles(){
        this.detalleOrdenService.getDetalles().subscribe({
            next: (res) => {
                if(res.status === 'ok'){
                    this.detalles = res.data;
                }
            },
            error:() => {
                this.router.navigate(['/login']);
            }
        });
     }
     obtenerNumeroOrden(idOrden: number): string {
        const orden = this.ordenes.find(o => o.Id_Orden === idOrden);
        return orden ? `Orden #${orden.Id_Orden}` : 'Orden no encontrada'; 
     }

     obtenerNombreProducto(idProducto: number): string {
        const producto = this.productos.find(p=> p.id === idProducto);
        return producto ? producto.nombre:'Producto no encontrado';
     }

     calcularSubtotal(): number{
        if (this.nuevoDetalle.Cantidad && this.nuevoDetalle.Precio){
            return this.nuevoDetalle.Cantidad * this.nuevoDetalle.Precio;


        }
        return 0;
     }
     calcularSubtotalEdicion(): number {
        if (this.editandoDetalle && this.editandoDetalle.Cantidad && this.editandoDetalle.Precio) {
            return this.editandoDetalle.Cantidad * this.editandoDetalle.Precio;
        }
        return 0;
     }

     crearDetalle() {
        if(!this.nuevoDetalle.Cantidad || !this.nuevoDetalle.Precio || !this.nuevoDetalle.Id_Orden || !this.nuevoDetalle.Id_Producto){
            alert('Todos los campos son obligatorios.');
            return;
        }
        if (this.nuevoDetalle.Precio <=0){
            alert('El precio debe ser mayor a 0.');
            return;
        }
        this.detalleOrdenService.crearDetalle(this.nuevoDetalle).subscribe({
            next: (res) =>{
                if(res.status === 'ok'){
                    this.cargarDetalles();
                    this.nuevoDetalle = {Cantidad: '', Precio: '', Id_Orden: '', Id_Producto: ''};
                }else{
                    alert(res.message);
                }
            },
            error:()=>{
                alert('Error al crear detalle de orden.');
            }

        });
     }
     editarDetalle(detalle: any) {
        this.editandoDetalle = { ...detalle };
     }
     guardarEdicion(){
        if(!this.editandoDetalle.Cantidad || !this.editandoDetalle.Precio || !this.editandoDetalle.Id_Orden || !this.editandoDetalle.Id_Producto){
            alert('Todos los campos son obligatorios.');
            return;
        }
        if(this.editandoDetalle.Cantidad<=0){
            alert('La cantidad debe ser mayor a 0.');
            return;
        }
        if(this.editandoDetalle.Precio <=0){
            alert('El precio debe ser mayor a 0.');
            return;
        }
        this.detalleOrdenService.editarDetalle(this.editandoDetalle.Id_Detalle, this.editandoDetalle).subscribe({
            next: (res) => {
                if(res.status === 'ok'){
                    this.cargarDetalles();
                    this.editandoDetalle = null;
                }else{
                    alert(res.message);
                }
            },
            error:() =>{
                alert('Error al editar detalle de orden');
            }
        });
     }
     cancelarEdicion(){
        this.editandoDetalle=null;
     }
     eliminarDetalle(id: number){
        if(confirm('¿Estás seguro de que quieres eliminar este detalle de orden?')){
            this.detalleOrdenService.eliminarDetalle(id).subscribe({
                next:(res)=>{
                    if(res.status === 'ok'){
                        this.cargarDetalles();
                    }else{
                        alert(res.message);
                    }
                },
                error:()=>{
                    alert('Error al eliminar detalle de orden.');
                }
            });
        }
     }
     calcularTotalGeneral():number{
        let total = 0;
        for (const detalle of this.detalles){
            total += detalle.Cantidad * detalle.Precio;
        }
        return total;
     }

}

