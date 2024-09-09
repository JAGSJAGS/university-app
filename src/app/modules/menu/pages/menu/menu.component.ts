import { Component } from '@angular/core';
import { from, Subscription, switchMap } from 'rxjs';
import { AuthService } from '../../../../auth.service';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { MenuService } from '../../menu.service';
import { Career, Year, Subject, Careers, Years, Subjects } from '../../../../interfaces/Career';
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


  rangeValues: number[] = [1, 4];
  allSubjects: Subjects = {data:[]};
  allSubjectsBackUp: Subjects = {data:[]};
  selectedSubjects: any = [];

  

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
  subjects: Subjects = {data: []};

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
    id: 0,
    name: "",
    code: "",
    quarts: [1, 4],
    validate: false,
    fail: false,
    requirements:  [],
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
        this.getAllSubjects();
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

selectSubjects(year: Year){
  this.year = {...year};
  this.subs.add(this.menuService.getSubjects(year).subscribe({
    next: (subjects) => {
      this.subjects = subjects;
      this.showSubjects();
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

getSubjects(){
  this.subs.add(this.menuService.getSubjects(this.year).subscribe({
    next: (subjects) => {
      this.subjects = {...subjects};
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

getAllSubjects(){
  this.subs.add(this.menuService.getAllSubjects(this.career).subscribe({
    next: (subjects) => {
      this.allSubjects = {...subjects};
      this.allSubjectsBackUp = {...subjects}
      console.log(this.allSubjects);
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

selectCreateSubject(){
  this.showCreateSubject = true; 
  this.showEditSubject = false;
  this.allSubjects = {...this.allSubjectsBackUp}
  this.subjectsSelected = [];
  this.rangeValues = [0, 1]
  this.subject = {
    id: 0,
    name: "",
    code: "",
    quarts: [1, 4],
    validate: false,
    fail: false,
    requirements:  [],
    credit: 0
  }
}

convertRange(num: number){
  let res = 0;
  if (num >= 0 && num <= 25) {
    res = 1;
  } else if (num >= 26 && num <= 50) {
    res = 2;
  } else if (num >= 51 && num <= 75) {
    res = 3;
  } else if (num >= 76 && num <= 100) {
    res = 4;
  }
  return res;
}
subjectsSelected: any[] = [];
createSubject(){
  this.subject.quarts[0] = this.convertRange(this.rangeValues[0]);
  this.subject.quarts[1] = this.convertRange(this.rangeValues[1]);
  this.subject.requirements = this.subjectsSelected.map(subject => subject.id);
  console.log(this.subject)
  console.log(this.year.id)
  if(this.validate()){
    this.subs.add(this.menuService.createSubject(this.subject, this.year).subscribe({
      next: (subject) => {
        this.subject = {
          id: 0,
          name: "",
          code: "",
          quarts: [1, 4],
          validate: false,
          fail: false,
          requirements:  [],
          credit: 0
        }
        this.getSubjects();
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

selectEditSubject(subject: Subject){
  this.allSubjects = {...this.allSubjectsBackUp}
  this.subjectsSelected = [];
  this.showEditSubject = false;
  setTimeout(() => {
    this.showEditSubject = true;
  }, 10);
  this.showCreateSubject = false;
  this.subject = {...subject}
  console.log(this.subject.quarts[0]);
  console.log(this.subject.quarts[1]);
  this.rangeValues [0] = this.reverseConvertRange(this.subject.quarts[0]);
  this.rangeValues [1] = this.reverseConvertRange(this.subject.quarts[1]);
  subject.requirements.forEach( id => {
    this.selectSubject(id);
  })
}

editSubject(){
  this.subject.quarts[0] = this.convertRange(this.rangeValues[0]);
  this.subject.quarts[1] = this.convertRange(this.rangeValues[1]);
  this.subject.requirements = this.subjectsSelected.map(subject => subject.id);
  if(this.validate()){
    this.subs.add(this.menuService.updateSubject(this.subject, this.year).subscribe({
      next: (subject) => {
        this.subject = {...subject.data}
        this.getSubjects();
        this.showEditSubject = false;
        setTimeout(() => {
          this.showEditSubject = true;
        }, 10);
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

reverseConvertRange(num: number): number {
  let res = 0;
  
  switch(num) {
    case 1:
      res = 12.5; // Centrado en el rango 0-25
      break;
    case 2:
      res = 37.5; // Centrado en el rango 26-50
      break;
    case 3:
      res = 62.5; // Centrado en el rango 51-75
      break;
    case 4:
      res = 87.5; // Centrado en el rango 76-100
      break;
  }
  return res;
}

////////////////////////////////////////////////////////////
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

  selectSubject(id: number) {
    let subjectToDelete = this.allSubjects.data.find(subject => subject.id === id);
  
    if (subjectToDelete) {
      this.subjectsSelected.push(subjectToDelete);
      this.allSubjects.data = this.allSubjects.data.filter(subject => subject.id !== id);
    }
  }
  

  discardSelectSubject(id: number) {
    let subjectToRestore = this.subjectsSelected.find(subject => subject.id === id);
  
    if (subjectToRestore) {
      this.allSubjects.data.push(subjectToRestore);
      this.subjectsSelected = this.subjectsSelected.filter(subject => subject.id !== id);
    }
  }
}
