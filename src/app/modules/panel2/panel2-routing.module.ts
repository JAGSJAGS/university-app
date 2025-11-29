import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Panel2Component } from './pages/panel2/panel2.component';

const routes: Routes = [
  {
    path: '',
    component: Panel2Component,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Panel2RoutingModule {}
