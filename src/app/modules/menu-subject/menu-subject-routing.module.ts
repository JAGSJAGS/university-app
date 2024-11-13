import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuSubjectComponent } from './pages/menu-subject/menu-subject.component';

const routes: Routes = [
  {
    path: '',
    component: MenuSubjectComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MenuSubjectRoutingModule {}
