import {Injectable} from '@angular/core';
import { HttpClient }  from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
    providedIn:'root'
})
export class ProductosService{
    private apiUrl = '/api';

    constructor(private http:HttpClient){}

    getProductos(): Observable <any>{
        return this.http.get(`${this.apiUrl}/productos`);
    }

    crearProducto(producto: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/productos`, producto);
    }

    editarProducto(id: number, producto: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/productos/${id}`, producto);
    }

    eliminarProducto(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/productos/${id}`);
    }
}
