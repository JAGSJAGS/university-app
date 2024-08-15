import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelComponent } from './pages/panel/panel.component';
import { PanelRoutingModule } from './panel-routing.module';
import { PrimeNgModule } from '../prime-ng/prime-ng.module';
import {DragDropModule} from '@angular/cdk/drag-drop';



@NgModule({
  declarations: [
    PanelComponent
  ],
  imports: [
    CommonModule,
    PanelRoutingModule,
    PrimeNgModule,
    DragDropModule
  ]
})
export class PanelModule { }
