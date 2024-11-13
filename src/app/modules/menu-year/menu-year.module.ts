import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuYearComponent } from './pages/menu-year/menu-year.component';
import { MenuYearRoutingModule } from './menu-year-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { PrimeNgModule } from '../prime-ng/prime-ng.module';



@NgModule({
  declarations: [
    MenuYearComponent
  ],
  imports: [
    CommonModule,
    MenuYearRoutingModule,
    TranslateModule,
    FormsModule,
    PrimeNgModule
  ]
})
export class MenuYearModule { }
