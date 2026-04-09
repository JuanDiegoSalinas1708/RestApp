import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { HomeComponent } from './pages/home/home.component';
import { InventarioComponent } from './pages/inventario/inventario.component';
import { OrdenesComponent } from './pages/ordenes/ordenes.component';
import { DetalleOrdenComponent } from './pages/detalle-orden/detalle-orden.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'registro', component: RegistroComponent },
    {
        path: 'home',
        component: HomeComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardComponent },
            { path: 'productos', component: ProductosComponent },
            { path: 'inventario', component: InventarioComponent },
            { path: 'ordenes', component: OrdenesComponent },
            { path: 'detalle-orden', component: DetalleOrdenComponent },
            { path: 'usuarios', component: UsuariosComponent }
        ]
    }
];