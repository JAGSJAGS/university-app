import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { MenuSubjectService } from '../../menu-subject.service';
import { Career, Group, Subject, Subjects, Year } from '../../../../interfaces/Career';
import { Location } from '@angular/common';
import { Message } from 'primeng/api';

@Component({
  selector: 'app-menu-subject',
  templateUrl: './menu-subject.component.html',
  styleUrl: './menu-subject.component.scss'
})
export class MenuSubjectComponent {
  subs: Subscription = new Subscription();

  showCreateSubject: boolean = false;
  showEditSubject: boolean = false;
  showNewGroup: boolean = false;
  showDeleteGroup: boolean = false;
  showDeleteSubject: boolean = false;
  showMessage: boolean = false;

  allSubjects: Subjects = {data:[]};
  allSubjectsBackUp: Subjects = {data:[]};
  subjects: Subjects = {data: []};
  subjectsSelected: any[] = [];
  rangeValues: number[] = [1, 4];
  selectsGroups: any [] = [];
  selectsNoGroups: any [] = [];
  allGroupsBackup: any = [];
  groupSelect: any = [];
  groups: any = [];

  groupDeleteId: number = 0;
  nameGroup: string = "";
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

  constructor(
    private authService: AuthService,
    private storage: Storage,
    private router: Router,
    private menuSubjectService: MenuSubjectService,
    private activatedRoute: ActivatedRoute,
    private location: Location
  ){}

  ngOnInit(): void {
    this.initLoad();
    
    
  }
  initLoad(){
    this.activatedRoute.params.subscribe(({ id }) => {
      this.year.id = id
      this.getSubjects();
      this.getYear(id);
    });
  }

  getYear(yearId: number){
    this.showSpinner = true;
    this.subs.add(this.menuSubjectService.getYear(yearId).subscribe({
      next: (year) => {
        this.year = year.data;
        this.career.id = this.year.career_id;
        console.log(this.career)
        this.getAllGroups();
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

  showSpinner: boolean = false;
  logoutUser(){
    this.showSpinner = true;
    this.subs.add(this.authService.logOutUser().subscribe({
      next: (valor) => {
        this.showSpinner = false;
        this.storage.set('authenticated', false);
        this.storage.set('access_token', "");
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.showSpinner = false;
        this.storage.set('authenticated', false);
        this.storage.set('access_token', "");
        console.log("error logOutUser: " + error);
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

    this.showSpinner = true;
    this.subs.add(this.menuSubjectService.orderSubject(this.career.id, this.year, subjectIds).subscribe({
      next: (subjects) => {
        this.showSpinner = false;
      },
      error: (error) => {
        this.showSpinner = false;
        if (error && error.error && error.error.message) {
          //this.messageError = error.error.message; 
          console.log("Mensaje: error orderSubjects", error.error.message);
        } else {
          console.log("Error desconocido");
        } 
      }
    }));
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

  selectSubject(id: number) {
    let subjectToDelete = this.allSubjects.data.find(subject => subject.id === id);
  
    if (subjectToDelete) {
      this.subjectsSelected.push(subjectToDelete);
      this.allSubjects.data = this.allSubjects.data.filter(subject => subject.id !== id);
    }
  }

  
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

  getSubjects(){
    this.showSpinner = true;
    this.subs.add(this.menuSubjectService.getSubjects(this.year).subscribe({
      next: (subjects) => {
        this.subjects = {...subjects};
        this.showSpinner = false;
        //this.career.id = this.subjects.data[0].career_id;
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
        this.showSpinner = false;
      }
    }));
  }

  selectDeleteSubject(subject: Subject){
    this.showDeleteSubject = true;
    this.subject = {...subject};
  }

  deleteSubject(){
    this.showSpinner = true;
    this.subs.add(this.menuSubjectService.deleteSubject(this.subject.id).subscribe({
      next: (subject) => {
        this.getSubjects();
        this.getAllSubjects();
        this.showSpinner = false;
        this.messages[0].severity = "success";
        this.messages[0].summary = "Success delete subject"
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
        this.messages[0].summary = "Error delete subject"
        this.showMessage = true;
      }
    }));
  }

  getAllSubjects(){
    this.showSpinner = true;
    this.subs.add(this.menuSubjectService.getAllSubjects(this.career).subscribe({
      next: (subjects) => {
        this.allSubjects = {...subjects};
        this.allSubjectsBackUp = {...subjects}
        console.log(this.allSubjects);
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

  editSubject(){
    this.subject.quarts[0] = this.convertRange(this.rangeValues[0]);
    this.subject.quarts[1] = this.convertRange(this.rangeValues[1]);
    this.subject.requirements = this.subjectsSelected.map(subject => subject.id);
    
    if(this.validate()){
      this.showSpinner = true;
      this.subs.add(this.menuSubjectService.updateSubject(this.subject, this.year, this.selectsNoGroups.map(group => group.id)).subscribe({
        next: (subject) => {
          this.subject = {...subject.data}
          this.getSubjects();
          this.showEditSubject = false;
          setTimeout(() => {
            this.showEditSubject = true;
          }, 10);
          this.showSpinner = false;
          this.messages[0].severity = "success";
          this.messages[0].summary = "Success edit subject"
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
          this.messages[0].summary = "Error edit subject"
          this.showMessage = true;
        }
      }));
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

  discardSelectSubject(id: number) {
    let subjectToRestore = this.subjectsSelected.find(subject => subject.id === id);
  
    if (subjectToRestore) {
      this.allSubjects.data.push(subjectToRestore);
      this.subjectsSelected = this.subjectsSelected.filter(subject => subject.id !== id);
    }
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

  createSubject(){
    this.subject.quarts[0] = this.convertRange(this.rangeValues[0]);
    this.subject.quarts[1] = this.convertRange(this.rangeValues[1]);
    this.subject.requirements = this.subjectsSelected.map(subject => subject.id);
    console.log(this.subject)
    console.log(this.year.id)
    if(this.validate()){
      this.showSpinner = true;
      this.subs.add(this.menuSubjectService.createSubject(this.subject, this.year, this.groupSelect.map((group : any) => group.id)).subscribe({
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
          this.showSpinner = false;
          this.messages[0].severity = "success";
          this.messages[0].summary = "Success create subject"
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
          this.messages[0].summary = "Error create subject"
          this.showMessage = true;
        }
      }));
    }
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

  getAllGroups(){
    this.showSpinner = true;
    this.subs.add(this.authService.getAllGroups().subscribe({
      next: (groups) => {
        this.groups = [...groups.data]
        this.selectsGroups  = [...groups.data]
        this.allGroupsBackup = [...groups.data];
        this.groupsFilter();
        this.showSpinner = false;
      },
      error: (error) => {
        if (error && error.error && error.error.message) {
          //this.messageError = error.error.message; 
          console.log("Mensaje: error getGroups", error.error.message);
        } else {
          console.log("Error desconocido");
        } 
        this.showSpinner = false;
      }
    }));
  }

  createGroup(){
    this.showSpinner = true;
    this.subs.add(this.authService.createGroup(this.nameGroup).subscribe({
      next: (group) => {
        this.getAllGroups();
        this.showNewGroup = false;
        this.showSpinner = false;
        this.messages[0].severity = "success";
        this.messages[0].summary = "Success create group"
        this.showMessage = true;
      },
      error: (error) => {
        if (error && error.error && error.error.message) {
          //this.messageError = error.error.message; 
          console.log("Mensaje: error getGroups", error.error.message);
        } else {
          console.log("Error desconocido");
        } 
        this.showSpinner = false;
        this.messages[0].severity = "error";
        this.messages[0].summary = "Error create group"
        this.showMessage = true;
      }
    }));
  }

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

  validate(){
    return true;
  }

  goBack(): void {
    this.location.back();
  }
}
