import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Panel2Component } from './pages/panel2/panel2.component';
import { Panel2RoutingModule } from './panel2-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { PrimeNgModule } from '../prime-ng/prime-ng.module';
import { PanelRoutingModule } from '../panel/panel-routing.module';
import { FormsModule } from "@angular/forms";



@NgModule({
  declarations: [
    Panel2Component
  ],
  imports: [
    CommonModule,
    Panel2RoutingModule,
    PrimeNgModule,
    TranslateModule,
    FormsModule
]
})
export class Panel2Module { }
