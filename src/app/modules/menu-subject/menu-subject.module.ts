import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuSubjectRoutingModule } from './menu-subject-routing.module';
import { FormsModule } from '@angular/forms';
import { PrimeNgModule } from '../prime-ng/prime-ng.module';
import { TranslateModule } from '@ngx-translate/core';
import { MenuSubjectComponent } from './pages/menu-subject/menu-subject.component';
import { DragDropModule } from 'primeng/dragdrop';



@NgModule({
  declarations: [
    MenuSubjectComponent
  ],
  imports: [
    CommonModule,
    MenuSubjectRoutingModule,
    TranslateModule,
    FormsModule,
    PrimeNgModule,
    DragDropModule
  ]
})
export class MenuSubjectModule { }
