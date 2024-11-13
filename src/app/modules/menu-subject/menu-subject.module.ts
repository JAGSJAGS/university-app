import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuSubjectComponent } from './pages/menu-subject/menu-subject.component';
import { MenuSubjectRoutingModule } from './menu-subject-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { PrimeNgModule } from '../prime-ng/prime-ng.module';



@NgModule({
  declarations: [
    MenuSubjectComponent
  ],
  imports: [
    CommonModule,
    MenuSubjectRoutingModule,
    TranslateModule,
    FormsModule,
    PrimeNgModule
  ]
})
export class MenuSubjectModule { }
