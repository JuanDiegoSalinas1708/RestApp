import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DetalleOrdenService {
  private apiUrl = 'https://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getDetalles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/detalle-orden`);
  }

  crearDetalle(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/detalle-orden`, data);
  }

  editarDetalle(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/detalle-orden/${id}`, data);
  }

  eliminarDetalle(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/detalle-orden/${id}`);
  }
}