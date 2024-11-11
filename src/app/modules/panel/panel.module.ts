import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelComponent } from './pages/panel/panel.component';
import { PanelRoutingModule } from './panel-routing.module';
import { PrimeNgModule } from '../prime-ng/prime-ng.module';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [
    PanelComponent
  ],
  imports: [
    CommonModule,
    PanelRoutingModule,
    PrimeNgModule,
    DragDropModule,
    TranslateModule
  ]
})
export class PanelModule { }
