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
    rememberMe = false;
    error='';

    constructor(private authService:AuthService, private router:Router){}

    login(){
        this.error = '';

        if (!this.correo || !this.password) {
            this.error = 'Debe ingresar correo y contraseña.';
            return;
        }

        this.authService.login(this.correo, this.password, this.rememberMe).subscribe({
            next:(res)=>{
                if(res.status === 'ok'){
                    const storage = this.rememberMe ? localStorage : sessionStorage;
                    storage.setItem('usuario', JSON.stringify(res.usuario));
                    if (this.rememberMe) {
                        localStorage.setItem('rememberMe', 'true');
                    } else {
                        localStorage.removeItem('rememberMe');
                    }
                    this.router.navigate(['/home']);
                }
            },
            error: (err)=>{
                this.error = err.error?.message || 'Error al iniciar sesión';
            }
        });
    }
}