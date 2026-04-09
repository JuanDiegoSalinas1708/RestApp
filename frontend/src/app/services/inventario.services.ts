import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class InventarioService {
    private apiUrl = 'https://localhost:8000/api';  // ✅ SOLO HASTA /api

    constructor(private http: HttpClient) {}

    getInventario(): Observable<any> {
        return this.http.get(`${this.apiUrl}/inventario`);  // ✅ /inventario sin repetir
    }

    crearInventario(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/inventario`, data);
    }

    editarInventario(id: number, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/inventario/${id}`, data);
    }

    eliminarInventario(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/inventario/${id}`);
    }
}