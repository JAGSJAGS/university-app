import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./modules/home/home.module').then( m => m.HomeModule)
  },
  {
    path: 'panel2/:id',
    loadChildren: () => import('./modules/panel/panel.module').then( m => m.PanelModule)
  },
  {
    path: 'panel/:id',
    loadChildren: () => import('./modules/panel2/panel2.module').then( m => m.Panel2Module)
  },
  {
    path: 'login',
    loadChildren: () => import('./modules/login/login.module').then( m => m.LoginModule)
  },
  /* {
    path: 'menu',
    loadChildren: () => import('./modules/menu/menu.module').then( m => m.MenuModule),
    canActivate: [AuthGuard]
  }, */
  {
    path: 'menu-career',
    loadChildren: () => import('./modules/menu-career/menu-career.module').then( m => m.MenuCareerModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'menu-year/:id',
    loadChildren: () => import('./modules/menu-year/menu-year.module').then( m => m.MenuYearModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'menu-subject/:id',
    loadChildren: () => import('./modules/menu-subject/menu-subject.module').then( m => m.MenuSubjectModule),
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
