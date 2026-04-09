import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = 'https://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios/todos`);
  }

  getUsuario(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios/${id}`);
  }

  crearUsuario(data: any): Observable<any> {  // ✅ Método agregado
    return this.http.post(`${this.apiUrl}/usuarios`, data);
  }

  editarUsuario(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/${id}`, data);
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/usuarios/${id}`);
  }
}