import {Routes} from '@angular/router';
import {LoginComponent} from './pages/login/login.component';
import {RegistroComponent} from './pages/registro/registro.component';

import {ProductosComponent} from './pages/productos/productos.component';

export const routes:Routes = [
    {path:'',redirectTo:'login',pathMatch:'full'},
    {path: 'login', component:LoginComponent},
    {path: 'registro', component:RegistroComponent},
    {path:'productos',component:ProductosComponent},
];
