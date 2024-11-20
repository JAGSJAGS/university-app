import { Component } from '@angular/core';
import { AuthService } from '../../../../auth.service';
import { Subscription } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuYearService } from '../../menu-year.service';
import { Career, Subject, Year, Years } from '../../../../interfaces/Career';
import { Location } from '@angular/common';
import { Message } from 'primeng/api';

@Component({
  selector: 'app-menu-year',
  templateUrl: './menu-year.component.html',
  styleUrl: './menu-year.component.scss'
})
export class MenuYearComponent {
  subs: Subscription = new Subscription();

  showSpinner = false;
  showAllYears = false;
  showCreateYear = false;
  showEditYear = false;
  showDeleteYear: boolean = false;
  showMessage: boolean = false;

  years: Years = {data: []};
  allYears: any[] = [];
  messages: Message[] = [
    { severity: 'success', summary: 'Success'}
  ];
  year: Year = {
    id:0,
    year:0,
    subjects:[],
    career_id: 0,
    career_name: ""
  }
  career: Career = {
    id:0,
    name: "",
    years: []
  }

  constructor(
    private authService: AuthService,
    private storage: Storage,
    private router: Router,
    private menuYearService: MenuYearService,
    private activatedRoute: ActivatedRoute,
    private location: Location
  ){

  }

  ngOnInit(): void {
    this.initLoad();
  }
  initLoad(){
    this.activatedRoute.params.subscribe(({ id }) => {
      this.career.id = id
      this.getYears();
      this.getCareer(id);
    });
  }

  logoutUser(){
    this.showSpinner = true;
    this.subs.add(this.authService.logOutUser().subscribe({
      next: (valor) => {
        this.showSpinner = false;
        this.storage.set('authenticated', false);
        this.storage.set('access_token', "");
        this.router.navigate(['/home']);
        this.showSpinner = false;
      },
      error: (error) => {
        this.showSpinner = false;
        this.storage.set('authenticated', false);
        this.storage.set('access_token', "");
        console.log("error logOutUser: " + error);
        this.showSpinner = false;
      }
    }));
  }

  getCareer(careerId: number){
    this.showSpinner = true;
    this.subs.add(this.menuYearService.getCareer(careerId).subscribe({
      next: (career) => {
        this.career = career.data;
        this.showSpinner = false;
      },
      error: (error) => {
        if (error && error.error && error.error.message) {
          //this.messageError = error.error.message; 
          console.log("Mensaje: error getCareer", error.error.message);
        } else {
          console.log("Error desconocido");
        } 
        this.showSpinner = false;
      }
    }));
  }

  getAllYears(){
    this.showSpinner = true;
    this.subs.add(this.menuYearService.getAllYears().subscribe({
      next: (allYears) => {
        this.allYears = allYears.data;
        this.showSpinner = false;
      },
      error: (error) => {
        if (error && error.error && error.error.message) {
          //this.messageError = error.error.message; 
          console.log("Mensaje: error getAllYears", error.error.message);
        } else {
          console.log("Error desconocido");
        } 
        this.showSpinner = false;
      }
    }));
  }
  
  getYears(){
    this.showSpinner = true;
    this.subs.add(this.menuYearService.getYears(this.career).subscribe({
      next: (years) => {
        this.years = years;
        this.showSpinner = false;
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
      }
    }));
  }

  createYear(){
    if(this.validate()){
      this.showSpinner = true;
      this.subs.add(this.menuYearService.createYear(this.year, this.career).subscribe({
        next: (year) => {
          this.getYears();
          this.showSpinner = false;
          this.messages[0].severity = "success";
          this.messages[0].summary = "Success create year"
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
          this.messages[0].summary = "Error create year"
          this.showMessage = true;
        }
      }));
    }
  }

  updateYear(){
    if(this.validate()){
      this.showSpinner = true;
      this.subs.add(this.menuYearService.updateYear(this.year).subscribe({
        next: (year) => {
          this.getYears();
          this.messages[0].severity = "success";
          this.messages[0].summary = "Success edit year"
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
          this.messages[0].summary = "Error update year"
          this.showMessage = true;
        }
      }));
    }
  }

  cloneYear(year: Year){
    this.showSpinner = true;
    this.subs.add(this.menuYearService.cloneYear(this.career.id, year.id).subscribe({
      next: (years) => {
        console.log(years);;
        this.getYears();
        this.showSpinner = false;
        this.messages[0].severity = "success";
        this.messages[0].summary = "Success clone year"
        this.showMessage = true;
      },
      error: (error) => {
        if (error && error.error && error.error.message) {
          //this.messageError = error.error.message; 
          console.log("Mensaje: error orderSubjects", error.error.message);
        } else {
          console.log("Error desconocido");
        } 
        this.showSpinner = false;
        this.messages[0].severity = "error";
        this.messages[0].summary = "Error clone year"
        this.showMessage = true;
      }
    }));
  }

  deleteYear(){
    this.showSpinner = true;
    this.subs.add(this.menuYearService.deleteYear(this.year).subscribe({
      next: (year) => {
        this.getYears();
        this.showSpinner = false;
        this.messages[0].severity = "success";
        this.messages[0].summary = "Success delete year"
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
        this.messages[0].summary = "Error create year"
        this.showMessage = true;
      }
    }));
  }

  selectCreateYear(){
    this.showCreateYear = true;
    this.showEditYear = false;
  }

  selectSubjects(year: Year){
    this.router.navigate(['/menu-subject', year.id]);
  }

  selectUpdateYear(year: Year){
    this.year = { ...year };
    this.showEditYear = true; 
    this.showCreateYear = false;
  }

  selectDeleteYear(year: Year){
    this.showDeleteYear = true;
    this.year = {...year};
  }

  validate(){
    return true
  }

  goBack(): void {
    this.location.back();
  }
}
