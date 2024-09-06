import { Component } from '@angular/core';
import { from, Subscription, switchMap } from 'rxjs';
import { AuthService } from '../../../../auth.service';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { MenuService } from '../../menu.service';
import { Career, Year, Subject, Careers, Years } from '../../../../interfaces/Career';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {

  subs: Subscription = new Subscription();

  email: string = "";
  password: string = "";
  messageError: string = "";
  severetyMessage: string = "";
  nameFile: string = "";
  newNameCaeer: string = "";

  

  showSpinner: boolean = true;
  showMessageError: boolean = false;
  showCareer: boolean = true;
  showEditCareer: boolean = false;
  showCreateCareer: boolean = false;
  showYear: boolean = false;
  showEditYear: boolean = false;
  showCreateYear: boolean = false;
  showSubject: boolean = false;
  showCreateSubject: boolean = false;
  showEditSubject: boolean = false;
  showDeleteCareer: boolean = false;
  showDeleteYear: boolean = false;

  namesCareer: any[] = [];

  files: any = [];

  careers: Careers = {data: []};
  years: Years = {data: []};

  career: Career = {
    id:0,
    name: "",
    years: []
  }

  year: Year = {
    id:0,
    year:0,
    subjects:[]
  }


  subject: Subject = {
    id: "",
    name: "",
    code: "",
    quarts: [],
    validate: false,
    fail: false,
    requirement:  [],
    credit: 0
  }

  constructor(
    private authService: AuthService,
    private storage: Storage,
    private router: Router,
    private menuService: MenuService
  ){}

  ngOnInit(): void {
    //this.getNameCareers();
    this.getCareers();
  }

  getCareers(){
    this.showSpinner = true;
    this.subs.add(this.menuService.getCareers().subscribe({
      next: (careers) => {
        console.log(careers);
        this.careers = careers
      },
      error: (error) => {
        this.showSpinner = false;
        console.log("error getCategories: " + error);
      }
    }));
  }

  selectEditCareer(career: Career){
    this.showEditCareer = true;
    this.showCreateCareer = false;
    this.career = {...career};
  }

  updateCareer(){
    if(this.validate()){
      this.subs.add(this.menuService.updateCareer(this.career).subscribe({
        next: (career) => {
          this.getCareers();
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
        }
      }));
    }
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

  createCareer(){
    if(this.validate()){
      this.subs.add(this.menuService.createCareer(this.career).subscribe({
        next: (career) => {
          this.career = {
            id:0,
            name: "",
            years: []
          }
          this.getCareers();
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
        }
      }));
    }
  }

  selectDeleteCareer(career: Career){
    this.showDeleteCareer = true;
    this.career = {...career};
  }

  deleteCareer(){
    this.subs.add(this.menuService.deleteCareer(this.career).subscribe({
      next: (career) => {
        this.getCareers();
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
      }
    }));
  }







/////////////////////////////////////////////////////////




  selectYears(career: Career){
    this.career = {...career}
    this.subs.add(this.menuService.getYears(this.career).subscribe({
      next: (years) => {
        this.years = years;
        this.showYears();
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
      }
    }));
    
  }

  getYears(){
    this.subs.add(this.menuService.getYears(this.career).subscribe({
      next: (years) => {
        this.years = years;
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
      }
    }));
  }

  selectUpdateYear(year: Year){
    this.year = { ...year };
    this.showEditYear = true; 
    this.showCreateYear = false;
  }

  updateYear(){
    if(this.validate()){
      this.subs.add(this.menuService.updateYear(this.year).subscribe({
        next: (year) => {
          this.getYears();
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
        }
      }));
    }
  }

  selectCreateYear(){
    this.showCreateYear = true;
    this.showEditYear = false;
  }

  createYear(){
    if(this.validate()){
      this.subs.add(this.menuService.createYear(this.year, this.career).subscribe({
        next: (year) => {
          this.getYears();
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
        }
      }));
    }
  }

  selectDeleteYear(year: Year){
    this.showDeleteYear = true;
    this.year = {...year};
  }

  deleteYear(){
    this.subs.add(this.menuService.deleteYear(this.year).subscribe({
      next: (year) => {
        this.getYears();
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
      }
    }));
  }



//////////////////////////////////////////////////////////


  logoutUser(){
    this.showSpinner = true;
    this.subs.add(this.authService.logOutUser().subscribe({
      next: (valor) => {
        this.showSpinner = false;
        console.log('valor', valor);
        this.storage.set('authenticated', false);
        //this.authService.setAuthenticatedFlag(false);
        this.router.navigate(['/home']);

      },
      error: (error) => {
        this.showSpinner = false;
        this.storage.set('authenticated', false);
        console.log("error logOutUser: " + error);
      }
    }));
  }




  validate(){
    return true
  }

  allFalse(){
    this.showCareer = false;
    this.showEditCareer = false;
    this.showCreateCareer = false;
    this.showYear = false;
    this.showEditYear = false;
    this.showCreateYear = false;
    this.showSubject = false;
    this.showCreateSubject = false;
    this.showEditSubject = false;
  }

  showYears(){
    this.allFalse();
    this.showYear = true;
  }

  showCareers(){
    this.allFalse();
    this.showCareer = true;
  }

  showSubjects(){
    this.allFalse();
    this.showSubject = true;
  }
}
