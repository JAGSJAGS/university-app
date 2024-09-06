import { NgModule } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { MessageComponent } from './message/message.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { PrimeNgModule } from '../prime-ng/prime-ng.module';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    MessageComponent,
    SpinnerComponent
  ],
  exports:[
    MessageComponent,
    SpinnerComponent
  ],
  imports: [
    CommonModule,
    PrimeNgModule,
    FormsModule
  ]
})
export class ComponentsModule { }
