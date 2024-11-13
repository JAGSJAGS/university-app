import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuYearComponent } from './pages/menu-year/menu-year.component';

const routes: Routes = [
  {
    path: '',
    component: MenuYearComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MenuYearRoutingModule {}
