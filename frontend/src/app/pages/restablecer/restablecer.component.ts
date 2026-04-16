import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ModalComponent } from '../modal/modal.component';

@Component({
    selector: 'app-restablecer',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, ModalComponent],
    templateUrl: './restablecer.component.html',
    styleUrls: ['./restablecer.component.css']
})

export class RestablecerComponent implements OnInit{
    token = '';
    nuevaPassword = '';
    confirmarPassword = '';
    cargando = false;

    modalVisible = false;
    modalTitulo = '';
    modalMensaje = '';
    modalTipo: 'success' | 'error'| 'warning'| 'info' = 'info';
    modalAccionConfirmar: () => void = () => {};

    constructor(
        private authService: AuthService,
        private route: ActivatedRoute,
        private router: Router
    ){}

    ngOnInit(){
        this.token =this.route.snapshot.paramMap.get('token') ||'';
        if(!this.token){
            this.mostrarModal('Error','Token inválido','error',()=>{
                this.router.navigate(['/login']);

            });
        }

    }
    mostrarModal(titulo: string, mensaje: string, tipo: 'success'| 'error'| 'warning'| 'info' = 'info', onConfirm?: () => void){
        this.modalTitulo = titulo;
        this.modalMensaje = mensaje;
        this.modalTipo = tipo;
        this.modalAccionConfirmar = onConfirm ||(()=>this.cerrarModal());
        this.modalVisible = true; 
    }
    cerrarModal(){
        this.modalVisible = false;
    }
    onModalConfirmado(){
        if(this.modalAccionConfirmar){
            this.modalAccionConfirmar();
        }
        this.cerrarModal();
    }
    onSubmit(){
        if(!this.nuevaPassword || !this.confirmarPassword){
            this.mostrarModal('Campos incompletos','Por favor complete todos los campos.','warning');
            return;
        }
        if(this.nuevaPassword !== this.confirmarPassword){
            this.mostrarModal('Contraseñas no coinciden','Las contraseñas no coinciden.','warning');
            return;
        }
        this.cargando = true;
        this.authService.restablecerPassword(this.token, this.nuevaPassword).subscribe({
            next:(res:any) =>{
                this.cargando = false;
                if(res.status ==='ok'){
                    this.mostrarModal('Exito', res.message, 'success',()=>{
                        this.router.navigate(['/login']);
                    });
                }else{
                    this.mostrarModal('Error', res.message,'error');
                }
            },
            error:(err:any)=>{
                this.cargando = false;
                this.mostrarModal('Error', err.error?.message || 'Error al restablecer contraseña.','error');
            }
        });
    }
}