import { Component } from '@angular/core';
import { from, Subscription, switchMap } from 'rxjs';
import { AuthService } from '../../../../auth.service';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { MenuService } from '../../menu.service';
import { Career, Year, Subject, Careers, Years, Subjects, Group } from '../../../../interfaces/Career';
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

  showCreateGroup: boolean = false;
  showEditGroup: boolean = false;
  showDeleteGroup: boolean = false;
  showNewGroup: boolean = false;

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
    subjects:[],
    career_id: 0
  }


  subject: Subject = {
    id: 0,
    name: "",
    code: "",
    quarts: [1, 4],
    validate: false,
    fail: false,
    requirements:  [],
    link: "",
    credit: 0,
    group: [{
      id: 0,
      name: ""
    }],
    groups: [],
    critic: false,
    career_id: 0
  }

  groups: any = [];
  groupSelect: any = []

  constructor(
    private authService: AuthService,
    private storage: Storage,
    private router: Router,
    private menuService: MenuService
  ){}

  ngOnInit(): void {
    //this.getNameCareers();
    this.getCareers();
    this.getAllGroups();
    
  }

  allGroupsBackup: any = [];
  getAllGroups(){
    this.subs.add(this.authService.getAllGroups().subscribe({
      next: (groups) => {
        this.groups = groups.data;
        this.selectsGroups  = [...groups.data]
        this.allGroupsBackup = [...groups.data];
      },
      error: (error) => {
        if (error && error.error && error.error.message) {
          //this.messageError = error.error.message; 
          console.log("Mensaje: error getGroups", error.error.message);
        } else {
          console.log("Error desconocido");
        } 
      }
    }));
  }

  allYears: any[] = [];
  showAllYears: boolean = false;
  getAllYears(){
    this.subs.add(this.menuService.getAllYears().subscribe({
      next: (allYears) => {
        this.allYears = allYears.data;
      },
      error: (error) => {
        if (error && error.error && error.error.message) {
          //this.messageError = error.error.message; 
          console.log("Mensaje: error getAllYears", error.error.message);
        } else {
          console.log("Error desconocido");
        } 
      }
    }));
  }

  nameGroup: string = "";
  createGroup(){
    this.subs.add(this.authService.createGroup(this.nameGroup).subscribe({
      next: (groups) => {
        this.getAllGroups();
        this.showNewGroup = false;
      },
      error: (error) => {
        if (error && error.error && error.error.message) {
          //this.messageError = error.error.message; 
          console.log("Mensaje: error getGroups", error.error.message);
        } else {
          console.log("Error desconocido");
        } 
      }
    }));
  }

  groupDeleteId: number = 0;
  deleteGroup(){
    this.subs.add(this.authService.deleteGroup(this.groupDeleteId).subscribe({
      next: (groups) => {
        this.getAllGroups();
      },
      error: (error) => {
        if (error && error.error && error.error.message) {
          //this.messageError = error.error.message; 
          console.log("Mensaje: error deleteGroup", error.error.message);
        } else {
          console.log("Error desconocido");
        } 
      }
    }));
  }

  selectGroup(id: number, name: string) {
    // Filtrar el grupo de la lista de groups
    this.groups = this.groups.filter((item: Group) => item.id !== id);
    
    // Solo pasar el id y el name a groupSelect
    this.groupSelect.push({ id, name });
  }

  deselectGroup(id: number) {
    // Encontrar el grupo con el id en groupSelect
    const groupToRemove = this.groupSelect.find((group: { id: number }) => group.id === id);
    
    if (groupToRemove) {
      // Eliminar de groupSelect
      this.groupSelect = this.groupSelect.filter((group: { id: number }) => group.id !== id);
      
      // Agregar el grupo de vuelta a groups
      this.groups.push(groupToRemove); // Aquí puedes reinsertar el grupo si lo necesitas
    }
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
    link: "",
    credit: 0,
    group: [{
      id: 0,
      name: ""
    }],
    groups: [],
    critic: false,
    career_id: 0
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
    this.subs.add(this.menuService.createSubject(this.subject, this.year, this.groupSelect.map((group : any) => group.id)).subscribe({
      next: (subject) => {
        this.subject = {
          id: 0,
          name: "",
          code: "",
          quarts: [1, 4],
          validate: false,
          fail: false,
          requirements:  [],
          link: "",
          credit: 0,
          group: [{
            id: 0,
            name: ""
          }],
          groups: [],
          critic: false,
          career_id: 0
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
  this.groupsFilter();
}

selectsGroups: any [] = [];
selectsNoGroups: any [] = [];
groupsFilter(){
  this.subject.group
  let groupIds = this.subject.group.map(group => group.id);
  this.selectsGroups = this.allGroupsBackup.filter((group : any) =>
    !groupIds.includes(group.id)
  );
  
  this.selectsNoGroups = this.allGroupsBackup.filter((group : any) =>
    groupIds.includes(group.id)
  );
}

selectsGroupsSubject(subject: Subject, group: any) {
  const groupId = group.id; // ID del grupo a mover

  // Verificar si el grupo está en selectsGroups (seleccionado)
  const groupIndex = this.selectsGroups.findIndex(g => g.id === groupId);

  if (groupIndex !== -1) {
    // Si el grupo está seleccionado, lo movemos a los no seleccionados
    const groupToMove = this.selectsGroups.splice(groupIndex, 1)[0]; // Elimina el grupo de selectsGroups
    this.selectsNoGroups.push(groupToMove); // Agrega el grupo a selectsNoGroups
  } else {
    // Si el grupo no está seleccionado, lo movemos a los seleccionados
    const groupIndexInNoSelect = this.selectsNoGroups.findIndex(g => g.id === groupId);
    if (groupIndexInNoSelect !== -1) {
      // Si el grupo está en selectsNoGroups, lo movemos a selectsGroups
      const groupToMove = this.selectsNoGroups.splice(groupIndexInNoSelect, 1)[0]; // Elimina el grupo de selectsNoGroups
      this.selectsGroups.push(groupToMove); // Agrega el grupo a selectsGroups
    }
  }
}

editSubject(){
  this.subject.quarts[0] = this.convertRange(this.rangeValues[0]);
  this.subject.quarts[1] = this.convertRange(this.rangeValues[1]);
  this.subject.requirements = this.subjectsSelected.map(subject => subject.id);
  
  if(this.validate()){
    this.subs.add(this.menuService.updateSubject(this.subject, this.year, this.selectsNoGroups.map(group => group.id)).subscribe({
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

deleteSubject(id: number){
  this.subs.add(this.menuService.deleteSubject(id).subscribe({
    next: (subject) => {
      this.getSubjects();
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


//////////////////////////////////////////////////////////////////////////////////////////////



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
    this.showCreateGroup = false;
    this.showEditGroup = false;
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

  order(direction: string, subjects: { data: Subject[] }, subject: Subject) {
    let index = subjects.data.findIndex(s => s.id === subject.id);

    if (index === -1) return; // Si el subject no existe, salir de la función

    if (direction === 'down' && index < subjects.data.length - 1) {
        // Intercambia con el siguiente subject si existe
        [subjects.data[index], subjects.data[index + 1]] = [subjects.data[index + 1], subjects.data[index]];
    } else if (direction === 'up' && index > 0) {
        // Intercambia con el anterior subject si existe
        [subjects.data[index], subjects.data[index - 1]] = [subjects.data[index - 1], subjects.data[index]];
    }

    let subjectIds = subjects.data.map((subject: Subject) => subject.id);

    this.subs.add(this.menuService.orderSubject(this.career.id, this.year, subjectIds).subscribe({
      next: (subjects) => {
      },
      error: (error) => {
        if (error && error.error && error.error.message) {
          //this.messageError = error.error.message; 
          console.log("Mensaje: error orderSubjects", error.error.message);
        } else {
          console.log("Error desconocido");
        } 
      }
    }));
  }

  cloneYear(year: Year){
    this.subs.add(this.menuService.cloneYear(this.career.id, year.id).subscribe({
      next: (years) => {
        console.log(years);
        this.years = years
      },
      error: (error) => {
        if (error && error.error && error.error.message) {
          //this.messageError = error.error.message; 
          console.log("Mensaje: error orderSubjects", error.error.message);
        } else {
          console.log("Error desconocido");
        } 
      }
    }));
  }
}
