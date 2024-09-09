import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from 'primeng/dragdrop';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { DropdownModule } from 'primeng/dropdown';
import { SliderModule } from 'primeng/slider';
import { ListboxModule } from 'primeng/listbox';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
  ],
  exports: [
    ButtonModule,
    DragDropModule,
    TableModule,
    PanelMenuModule,
    ToastModule,
    MessagesModule,
    DropdownModule,
    SliderModule,
    ListboxModule
  ]
})
export class PrimeNgModule { }
