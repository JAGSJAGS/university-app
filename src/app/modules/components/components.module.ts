import { NgModule } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { MessageComponent } from './message/message.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { PrimeNgModule } from '../prime-ng/prime-ng.module';
import { AddCareerComponent } from './add-career/add-career.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    MessageComponent,
    SpinnerComponent,
    AddCareerComponent
  ],
  exports:[
    MessageComponent,
    SpinnerComponent,
    AddCareerComponent
  ],
  imports: [
    CommonModule,
    PrimeNgModule,
    FormsModule
  ]
})
export class ComponentsModule { }
