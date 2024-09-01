import { Component } from '@angular/core';
import { from, Subscription, switchMap } from 'rxjs';
import { AuthService } from '../../../../auth.service';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { MenuService } from '../../menu.service';
import { Career, Year, Subject } from '../../../../interfaces/Career';
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
  nameCareer: string = "";

  

  showSpinner: boolean = true;
  showMessageError: boolean = false;
  showCareer: boolean = false;
  showEditCareer: boolean = false;
  showCreateCareer: boolean = false;
  showEditYear: boolean = false;
  showAddYear: boolean = false;

  namesCareer: string[] = [""];

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
    this.getNamesCareer();
  }

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

  getNamesCareer(){
    this.showSpinner = true;
    this.subs.add(this.menuService.getNamesCareer().subscribe({
      next: (namesCareer) => {
        this.showSpinner = false;
        this.namesCareer = namesCareer;
      },
      error: (error) => {
        this.showSpinner = false;
        console.log("error getCategories: " + error);
      }
    }));
  }

  selectCareer(){
    this.showSpinner = true;
    this.subs.add(this.menuService.getCareer(this.nameCareer).subscribe({
      next: (career) => {
        this.showSpinner = false;
        this.career = career
      },
      error: (error) => {
        this.showSpinner = false;
        console.log("error getCategories: " + error);
      }
    }));
  }

  yearSelect: number = 0;
  selectYear(){
    this.career.years.forEach(year => {

      if (year.year == this.yearSelect){
          this.year = year;
          console.log(this.year);
      }
    });
  }

  selectSubject(){
    this.year.subjects.forEach(subject => {

      if (subject.code == this.subject.code){
          this.subject = subject;
          console.log(this.subject);
      }
    });
  }

  createCareer(){
    if(this.validate()){
      /* this.showSpinner = true;
      this.showMessageError = false; */
      this.subs.add(this.menuService.createCareer(this.career).subscribe({
        next: (career) => {
          this.career = career;
          console.log(career.name)
          this.year = career.years[0];
          //this.subject = career.years[0].subjects[0]
          this.getNamesCareer();
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

  editCareer(){
    if(this.validate()){
      /* this.showSpinner = true;
      this.showMessageError = false; */
      this.subs.add(this.menuService.editCareer(this.career, this.nameCareer).subscribe({
        next: (career) => {
          this.career = career
          this.getNamesCareer();
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

  addYear(){
    let existYear:boolean = false;
    this.career.years.forEach(year => {
      if(year.year == this.year.year){
        existYear = true;
      }
    });
    if(!existYear){
      let newYear: Year = {
        id: 0,
        year: this.year.year,
        subjects: []
      }
      this.career.years.push(newYear);
      this.yearSelect = newYear.year
      console.log(this.career);
    }
    this.editCareer();
  }

  editYear(){
    this.career.years.forEach(year => {
      if(year.year == this.yearSelect){
        year.year = this.year.year;
        this.yearSelect = year.year;
      }
    });
    console.log('year', this.career)
    this.editCareer();
  }

  validate(){
    return true
  }
}
