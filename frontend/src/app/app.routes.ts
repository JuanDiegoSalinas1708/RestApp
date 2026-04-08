import {Routes} from '@angular/router';
import {LoginComponent} from './pages/login/login.component';
import {RegistroComponent} from './pages/registro/registro.component';

import {ProductosComponent} from './pages/productos/productos.component';
import {Usuarios} from './pages/usuarios/usuarios';
import {Inventario} from './pages/inventario/inventario';
import {Ordenes} from './pages/ordenes/ordenes';
import {DetalleOrden} from './pages/detalle-orden/detalle-orden';

export const routes:Routes = [
    {path:'',redirectTo:'login',pathMatch:'full'},
    {path: 'login', component:LoginComponent},
    {path: 'registro', component:RegistroComponent},
    {path:'productos',component:ProductosComponent},
    {path:'usuarios',component:Usuarios},
    {path:'inventario',component:Inventario},
    {path:'ordenes',component:Ordenes},
    {path:'detalle-orden',component:DetalleOrden},
];
