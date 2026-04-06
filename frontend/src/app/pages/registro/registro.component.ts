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
    edad=0;
    error='';
    exito='';

    constructor(private authService: AuthService, private router:Router){}

    registro(){
        this.authService.registro({
            nombre:this.nombre,
            apellido:this.apellido,
            correo:this.correo,
            password:this.password,
            edad:this.edad 
        }).subscribe({
            next:(res)=>{
                if(res.status === 'ok'){
                    this.exito='Cuenta creada correctamente, redirigiendo ...';
                    setTimeout(()=>this.router.navigate(['/login']),2000);
                }
            },
            error:(err)=>{
                this.error=err.error.message || 'Error al resgistrarse';
            }
        });
    }
}
