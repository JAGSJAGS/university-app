import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuCareerComponent } from './pages/menu-career/menu-career.component';

const routes: Routes = [
  {
    path: '',
    component: MenuCareerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MenuCareerRoutingModule {}
