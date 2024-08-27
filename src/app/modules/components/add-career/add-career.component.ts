import { Component } from '@angular/core';
import { Career } from '../../../interfaces/Career';
import { Subscription } from 'rxjs';
import { ComponentsService } from '../components.service';

@Component({
  selector: 'app-add-career',
  templateUrl: './add-career.component.html',
  styleUrl: './add-career.component.scss'
})
export class AddCareerComponent {

  subs: Subscription = new Subscription();

  constructor(
    private componentsService: ComponentsService
  ){

  }
  
  career: Career = {
    id: 0,
    name: "",
    years: []
  }
  createCareer(){
    if(this.validate()){
      /* this.showSpinner = true;
      this.showMessageError = false; */
      this.subs.add(this.componentsService.createCareer(this.career).subscribe({
        next: (valor) => {
        },
        error: (error) => {
          //this.showSpinner = false;
          console.log("Error en el inicio de sesión:", error);
          if (error && error.error && error.error.message) {
            //this.messageError = error.error.message; 
            console.log("Mensaje: error al crear Carrera", error.error.message);
          } else {
            console.log("Error desconocido");
          }
          /* this.showMessageError = true;
          this.severetyMessage = 'error' */
        }
      }));
    }
  }

  validate(): boolean{
    return true
  }
}
