import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink, Router }  from "@angular/router";
import { AuthService} from "../../services/auth.service";

@Component({
    selector:'app-registro',
    standalone:true,
    imports:[CommonModule,FormsModule,RouterLink],
    templateUrl:'./registro.component.html',
    styleUrls:['./registro.component.css']
})

export class RegistroComponent{
    nombre='';
    apellido='';
    correo='';
    password='';
    edad:number | null = null;
    error='';
    exito='';

    constructor(private authService: AuthService, private router:Router){}

    registro(){
        this.error = '';
        this.exito = '';

        if (!this.nombre || !this.apellido || !this.correo || !this.password || this.edad === null) {
            this.error = 'Todos los campos son obligatorios.';
            return;
        }

        if (this.edad <= 0) {
            this.error = 'La edad debe ser un número mayor a 0.';
            return;
        }

        if (!this.validarCorreo(this.correo)) {
            this.error = 'Ingresa un correo válido.';
            return;
        }

        if (this.password.length < 6) {
            this.error = 'La contraseña debe tener al menos 6 caracteres.';
            return;
        }

        this.authService.registro({
            nombre: this.nombre.trim(),
            apellido: this.apellido.trim(),
            correo: this.correo.trim(),
            password: this.password,
            edad: this.edad
        }).subscribe({
            next: (res) => {
                if (res.status === 'ok') {
                    this.exito = 'Cuenta creada correctamente. Redirigiendo a login...';
                    setTimeout(() => this.router.navigate(['/login']), 1800);
                }
            },
            error: (err) => {
                this.error = err.error?.message || 'Error al registrarse.';
            }
        });
    }

    private validarCorreo(correo: string): boolean {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(correo);
    }
}

