import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DetalleOrdenService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getDetalleOrden(): Observable<any> {
    return this.http.get(`${this.apiUrl}/detalle-orden`);
  }

  crearDetalleOrden(detalle: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/detalle-orden`, detalle);
  }

  editarDetalleOrden(id: number, detalle: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/detalle-orden/${id}`, detalle);
  }

  eliminarDetalleOrden(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/detalle-orden/${id}`);
  }
}