import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
private apiUrl = 'http://localhost:8000/api/auth';

  constructor(private http: HttpClient) {}

  login(correo: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { correo, password });
  }

  registro(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, data);
  }

  recuperarPassword(correo: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/recuperar`, { correo,password });
  }

  restablecerPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/restablecer/${token}`, { password });
  }

  verificarEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verificar/${token}`);
  }
}