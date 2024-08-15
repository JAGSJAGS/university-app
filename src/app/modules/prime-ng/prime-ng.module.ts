import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from 'primeng/dragdrop';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { PanelMenuModule } from 'primeng/panelmenu';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
  ],
  exports: [
    ButtonModule,
    DragDropModule,
    TableModule,
    PanelMenuModule
  ]
})
export class PrimeNgModule { }
