import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getInventario(): Observable<any> {
    return this.http.get(`${this.apiUrl}/inventario`);
  }

  crearInventario(inventario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/inventario`, inventario);
  }

  editarInventario(id: number, inventario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/inventario/${id}`, inventario);
  }

  eliminarInventario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/inventario/${id}`);
  }
}