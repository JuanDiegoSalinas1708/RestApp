import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrdenesService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getOrdenes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ordenes`);
  }

  crearOrden(orden: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ordenes`, orden);
  }

  editarOrden(id: number, orden: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/ordenes/${id}`, orden);
  }

  eliminarOrden(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/ordenes/${id}`);
  }
}