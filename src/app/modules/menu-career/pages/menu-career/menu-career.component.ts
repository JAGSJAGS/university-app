import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../auth.service';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';
import { Career, Careers } from '../../../../interfaces/Career';
import { MenuCareerService } from '../../menu-career.service';
import { Message } from 'primeng/api';

@Component({
  selector: 'app-menu-career',
  templateUrl: './menu-career.component.html',
  styleUrl: './menu-career.component.scss'
})
export class MenuCareerComponent {
  subs: Subscription = new Subscription();

  showSpinner: boolean = false;
  showCreateCareer: boolean = false;
  showEditCareer: boolean = false;
  showDeleteCareer: boolean = false;
  showMessage: boolean = false;

  messages: Message[] = [
    { severity: 'success', summary: 'Success'}
  ];

  career: Career = {
    id:0,
    name: "",
    years: []
  }

  careers: Careers = {data: []};

  constructor(
    private authService: AuthService,
    private storage: Storage,
    private router: Router,
    private menuCareerService: MenuCareerService
  ){}

  ngOnInit(): void {
    //this.getNameCareers();
    this.getCareers();
    //this.getAllGroups();
  }

  selectCreateCareer(){
    this.showCreateCareer = true; 
    this.showEditCareer = false;
    this.career = {
      id:0,
      name: "",
      years: []
    }
  }

  logoutUser(){
    this.showSpinner = true;
    this.subs.add(this.authService.logOutUser().subscribe({
      next: (valor) => {
        this.showSpinner = false;
        console.log('valor', valor);
        this.storage.set('authenticated', false);
        this.router.navigate(['/home']);
        this.storage.set('access_token', "");

      },
      error: (error) => {
        this.showSpinner = false;
        this.storage.set('authenticated', false);
        this.storage.set('access_token', "");
        console.log("error logOutUser: " + error);
      }
    }));
  }

  selectYears(career: Career){
    this.router.navigate(['/menu-year', career.id]);
  }

  selectEditCareer(career: Career){
    this.showEditCareer = true;
    this.showCreateCareer = false;
    this.career = {...career};
  }

  selectDeleteCareer(career: Career){
    this.showDeleteCareer = true;
    this.career = {...career};
  }

  createCareer(){
    if(this.validate()){
      this.showSpinner = true;
      this.subs.add(this.menuCareerService.createCareer(this.career).subscribe({
        next: (career) => {
          this.career = {
            id:0,
            name: "",
            years: []
          }
          this.getCareers();
          this.showSpinner = false;
          this.messages[0].severity = "success";
          this.messages[0].summary = "Success create career"
          this.showMessage = true;
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
          this.showSpinner = false;
          this.messages[0].severity = "erro";
          this.messages[0].summary = "Error create career"
          this.showMessage = true;
        }
      }));
    }
  }

  updateCareer(){
    if(this.validate()){
      this.showSpinner = true;
      this.subs.add(this.menuCareerService.updateCareer(this.career).subscribe({
        next: (career) => {
          this.getCareers();
          this.showSpinner = false;
          this.messages[0].severity = "success";
          this.messages[0].summary = "Success update career"
          this.showMessage = true;
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
          this.showSpinner = false;
          this.messages[0].severity = "error";
          this.messages[0].summary = "Error update career"
          this.showMessage = true;
        }
      }));
    }
  }

  getCareers(){
    this.showSpinner = true;
    this.subs.add(this.menuCareerService.getCareers().subscribe({
      next: (careers) => {
        console.log(careers);
        this.careers = careers
        this.showSpinner = false;
      },
      error: (error) => {
        this.showSpinner = false;
        console.log("error getCategories: " + error);
      }
    }));
  }

  deleteCareer(){
    this.showSpinner = true;
    this.subs.add(this.menuCareerService.deleteCareer(this.career).subscribe({
      next: (career) => {
        this.getCareers();
        this.showSpinner = false;
        this.messages[0].severity = "success";
        this.messages[0].summary = "Success delete career"
        this.showMessage = true;
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
        this.showSpinner = false;
        this.messages[0].severity = "error";
        this.messages[0].summary = "Error delete career"
        this.showMessage = true;
      }
    }));
  }

  validate(){
    return true
  }
}
