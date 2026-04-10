import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable}from 'rxjs';


@Injectable({
    providedIn:'root'
})
export class AuthService{
    private apiUrl = '/api';

    constructor(private http:HttpClient){}

    login(correo: string, password:string, rememberMe: boolean = false): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, { correo, password, rememberMe });
    }
    registro(data:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/registro`,data);
    }
}