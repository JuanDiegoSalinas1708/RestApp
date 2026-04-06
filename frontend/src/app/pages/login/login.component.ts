import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink, Router }  from "@angular/router";
import { AuthService} from "../../services/auth.service";

@Component({
    selector:'app-login',
    standalone:true,
    imports:[CommonModule,FormsModule,RouterLink],
    templateUrl:'./login.component.html',
    styleUrls:['./login.component.css']
})
export class LoginComponent{
    correo='';
    password='';
    error='';

    constructor(private authService:AuthService, private router:Router){}

    login(){
        this.authService.login(this.correo,this.password).subscribe({
            next:(res)=>{
                if(res.status === 'ok'){
                    localStorage.setItem('usuario',JSON.stringify(res.usuario));
                    this.router.navigate(['/productos']);
                }
            },
            error: (err)=>{
                this.error=err.error.message || 'Error al iniciar sesion';
            }
        });
    }
}