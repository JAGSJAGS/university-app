import { Component, ElementRef, Renderer2 } from '@angular/core';
import { Career, Subject, Year } from '../../../../interfaces/Career';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.scss'
})
export class PanelComponent {

  subs: Subscription = new Subscription();

  career: Career = {
    id:0,
    name: "",
    years: [{
      id:0,
      year:0,
      subjects:[{
          id: 0,
          name: "",
          code: "",
          quarts: [1, 4],
          validate: false,
          fail: false,
          requirements:  [],
          credit: 0
        }
      ]
    }]
  };

  careerBack!: Career;


  list1 = ['Get to workfdasfda'];

  constructor(
    private elementRef: ElementRef, 
    private renderer: Renderer2,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.initLoad();
  }
  initLoad(){
    this.activatedRoute.params.subscribe(({ id }) => {
      this.getCareer(id);
    });
  }

  getCareer(id: number){
    this.subs.add(this.authService.getCareer(id).subscribe({
      next: (career) => {
        this.career = career.data;
        this.careerBack = career.data;
        console.log(this.career);
      },
      error: (error) => {
        if (error && error.error && error.error.message) {
          //this.messageError = error.error.message; 
          console.log("Mensaje: error getCareer", error.error.message);
        } else {
          console.log("Error desconocido");
        } 
      }
    }));
  }
  /* loadFile(nameFile: string){
      this.subs.add(this.authService.getJsonFile(nameFile).subscribe({
        next: (career) => {
          this.career = career;
          this.careerBack = career;
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
          // this.showMessageError = true;
          //this.severetyMessage = 'error' 
        }
      }));
  } */

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const fileContent = e.target?.result;
      if (fileContent) {
        try {
          this.career = JSON.parse(fileContent as string);
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      }
    };

    reader.readAsText(file);
  }

  changeStyle(quarts: number[]) {
    let sizeQuart = quarts[1] - quarts[0];
    let width = '24%'
    let marginLeft = '0%'
    if(quarts[0] === 1){
      marginLeft = '0%'
    }
    if(quarts[0] === 2){
      marginLeft = '26%'
    }
    if(quarts[0] === 3){
      marginLeft = '51%'
    }

    if(sizeQuart === 3){
      width = "99%"
    }
    if(sizeQuart === 2){
      width = "74%"
    }
    if(sizeQuart === 1){
      width = "49%"
    }

    return {
      marginLeft: marginLeft,
      width: width
    };
  }

  showSubject(id: String, num: number){
    let subject = this.elementRef.nativeElement.querySelector('#small' + id);
    let subjectAll = this.elementRef.nativeElement.querySelector('#big' + id);
    if(num === 1){
      this.renderer.setStyle(subject, 'display', 'none'); 
      this.renderer.setStyle(subjectAll, 'display', 'flex'); 
      this.renderer.setStyle(subjectAll, 'flex-direction', 'column'); 
    }
    else{
      this.renderer.setStyle(subjectAll, 'display', 'none'); 
      this.renderer.setStyle(subject, 'display', 'block'); 
    }
  }

  paintFailSubject(subjectCode: string, fail: boolean, type: string, validate: boolean){
    let color: string = ""
    if(fail){
      color = '#7c3a3a';
      if(type === 'big'){
        color = '#7c3a3ab4';      
      }
      
    }
    else{
      //color = '#009172';
      if(type === 'big'){
        color = '#00ae8e';
      }
    }
    if(validate){
      color = '#a2c4c7';
    }
    let subject = this.elementRef.nativeElement.querySelector('#' + type + subjectCode);
    this.renderer.setStyle(subject, 'background-color', color); 
  }

  moveSubjectYear(subject: Subject, year: Year, position: string){
    if(position === "right"){
      if(this.existYear(year.year + 1)){
        //this.deleteSubjectYear(subjectCode, yearId, yearId + 1)
        this.moveRigth(subject, year);
      }
    }
    else{
      if(this.existYear(year.year - 1)){
        //this.deleteSubjectYear(subjectCode, yearId, yearId - 1)
        this.moveLeft(subject, year);
      }
    }
  }
  moveRigth(subject: Subject, year: Year){
    this.career.years.forEach(yea => {

      console.log(yea)
      if (yea.year=== year.year) {
        yea.subjects = yea.subjects.filter(sub => sub.id !== subject.id );
      }
      if (yea.year === year.year + 1) {
        yea.subjects.unshift(subject)
      }
      
    });
  }

  moveLeft(subject: Subject, year: Year){
    this.career.years.forEach(yea => {

      if (yea.year === year.year) {
        yea.subjects = yea.subjects.filter(sub => sub.id !== subject.id );
      }
      if (yea.year === year.year - 1) {
        yea.subjects.unshift(subject); 
      }
      
    });
  }

  paint(){
    this.career.years.forEach(year => {
      // Copiamos los subjects como array, no objeto
      let subjects = [...year.subjects]; // Asegúrate de que 'year.subjects' sea un array
      year.subjects.forEach(subject => {
        for (let sub of subjects) {
          if (sub.requirements.includes(subject.id)) {
            let subjectRend = this.elementRef.nativeElement.querySelector('#small' + subject.id);
            let subjectRend1 = this.elementRef.nativeElement.querySelector('#big' + subject.id);
            this.renderer.removeClass(subjectRend, 'highlight-important2');
            this.renderer.removeClass(subjectRend1, 'highlight-important2');
            this.renderer.addClass(subjectRend, 'highlight-important');
            this.renderer.addClass(subjectRend1, 'highlight-important');
          }
        }
      });
    });
  }
  

  deleteSubjectYear(subjectCode: number, yearInitialId: number, yearFinalId: number){
    let subjectToMove: any = null;

    // Buscar y eliminar el subject del año actual
    this.career.years.forEach(year => {
      if (year.year === yearInitialId) {
        const subjectIndex = year.subjects.findIndex(subject => subject.id === subjectCode);
        if (subjectIndex !== -1) {
            // Eliminar el subject y guardarlo
            subjectToMove = year.subjects.splice(subjectIndex, 1)[0];
        }
      }
    });
    if (subjectToMove) {
      this.career.years.forEach(year => {
        if (year.year === yearFinalId) {
            year.subjects.unshift(subjectToMove);
        }
      });
    }
  }

  existYear(yearId: number){
    return this.career.years.some(year => year.year === yearId)
  }

  validate(yearId: Year, subjectCode: number){
    this.career.years.forEach(year => {
      if (year.year === yearId.year) {
        year.subjects.forEach(subject =>{
          if(subject.id == subjectCode){
            if(subject.validate === true){
              subject.validate = false;
            }
            else{
              subject.validate = true;
            }
          }
        })  
      }
    });
  }

  fail(subject: Subject, year: Year){
    
    if(!subject.fail){
      if(this.existYear(year.year + 1)){
        this.changeBooleanFail(subject, year.id);
        this.addFail(subject, year);
      }
    }
    else{
      this.deleteFail(subject, year)
      if(this.existYear(year.year - 1)){
        this.changeBooleanFail(subject, year.id);
        this.deleteFail(subject, year)
      }
    }
  }

  addFail(subject: Subject, year: Year) {
    let subjectNew: Subject = {...subject}
    subjectNew.id = subject.id * -1
    console.log(year.year + 1);
    this.career.years.forEach(yea => {
      if (yea.year === year.year + 1) {
        yea.subjects.unshift(subjectNew); // Agrega el subject al inicio del array de subjects
        this.paintSubjecFail(subjectNew.id, subjectNew.fail);
        yea.subjects.forEach(subje => {
          if(subje.requirements.includes(subject.id)){
            let subjectRend = this.elementRef.nativeElement.querySelector('#small' + subje.id);
            let subjectRend1 = this.elementRef.nativeElement.querySelector('#big' + subje.id);
            this.renderer.removeClass(subjectRend, 'highlight-important2');
            this.renderer.removeClass(subjectRend1, 'highlight-important2');
            this.renderer.addClass(subjectRend, 'highlight-important');
            this.renderer.addClass(subjectRend1, 'highlight-important');
          }
        })
      }
    });
  }

  deleteFail(subject: Subject, year: Year){
    let subjectNew: Subject = {...subject}
    subjectNew.id = subject.id * -1
    this.career.years.forEach(yea => {
      if (yea.id === year.id + 1) {
        yea.subjects = yea.subjects.filter(sub => sub.id !== subjectNew.id );
        yea.subjects.forEach(subje => {
          if(subje.requirements.includes(subject.id)){
            let subjectRend = this.elementRef.nativeElement.querySelector('#small' + subje.id);
            let subjectRend1 = this.elementRef.nativeElement.querySelector('#big' + subje.id);
            this.renderer.removeClass(subjectRend, 'highlight-important');
            this.renderer.removeClass(subjectRend1, 'highlight-important');
            this.renderer.addClass(subjectRend, 'highlight-important2');
            this.renderer.addClass(subjectRend1, 'highlight-important2');
          }
        })
      }
      if(yea.id === year.id){
        yea.subjects.forEach(subje => {
          if(subje.id === subject.id){
            subje.fail = false
          }
        })
      }
    });
  }

  paintSubjecFail(subjectCode: number, fail: boolean){
    let subjectRend = this.elementRef.nativeElement.querySelector('#small' + subjectCode);
    let subjectRend1 = this.elementRef.nativeElement.querySelector('#big' + subjectCode);
    /* if(fail){
      this.renderer.removeClass(subjectRend, 'highlight-important2');
      this.renderer.removeClass(subjectRend1, 'highlight-important2');
      this.renderer.addClass(subjectRend, 'highlight-important');
      this.renderer.addClass(subjectRend1, 'highlight-important');
    }
    else{
      this.renderer.removeClass(subjectRend, 'highlight-important');
      this.renderer.removeClass(subjectRend1, 'highlight-important');
      this.renderer.addClass(subjectRend, 'highlight-important2');
      this.renderer.addClass(subjectRend1, 'highlight-important2');
    } */
  }

  requirementSubject(subjectCode: number, fail: boolean){

    this.career.years.forEach(year => {

        year.subjects.forEach(subject => {
          let subjectRend = this.elementRef.nativeElement.querySelector('#small' + subject.id);
          let subjectRend1 = this.elementRef.nativeElement.querySelector('#big' + subject.id);
          console.log(subject.id);
          console.log("subject:", subject)
          if (subject.id !== subjectCode && subject.requirements.includes(subjectCode)){
            if(fail){
              this.renderer.removeClass(subjectRend, 'highlight-important2');
              this.renderer.removeClass(subjectRend1, 'highlight-important2');
              this.renderer.addClass(subjectRend, 'highlight-important');
              this.renderer.addClass(subjectRend1, 'highlight-important');
            }
            else{
              this.renderer.removeClass(subjectRend, 'highlight-important');
              this.renderer.removeClass(subjectRend1, 'highlight-important');
              this.renderer.addClass(subjectRend, 'highlight-important2');
              this.renderer.addClass(subjectRend1, 'highlight-important2');
            }
          }
        });
    });
  }

  changeBooleanFail(subject: Subject, yearId: number){
    this.career.years.forEach(year => {
      if (year.id === yearId) {
        year.subjects.forEach(subjec =>{
          if(subjec.id == subject.id){
            if(subjec.fail === true){
              subjec.fail = false;
            }
            else{
              subjec.fail = true;
            }
          }
        })  
      }
    });
  }

  allHoursQuarts(subjects: Subject[], i: number){
    let res: number = 0;
    for (let subject of subjects) {
      if(subject.validate == false){
        res = this.hoursQuart(subject.quarts, subject.credit)[i] + res;
      }
    }
    return Math.trunc(res);
  }

  hoursQuart(quarts: number[], hours: number){
    let sizeQuart: number = quarts[1] - quarts[0]+1;
    let hoursQuarts: number = (hours/sizeQuart);
    let i = quarts[0] - 1;
    let j = quarts[1] - 1;
    let hoursPeriod: number[] = [0,0,0,0];
    while(i <= j){
      hoursPeriod[i] = hoursQuarts;
      i= i + 1;
    }
    return hoursPeriod;
  }

  paintValidateSubject(code: String, validate: boolean, type: string){
    let color: string = ""
    if(validate){
      color = '#a2c4c7';
    }
    else{
      color = '#009172';
      if(type === 'big'){
        color = '#00ae8e';      }
    }
    let subject = this.elementRef.nativeElement.querySelector('#' + type + code);
    this.renderer.setStyle(subject, 'background-color', color); 
  }

  suma(num1: number, num2: number, num3: number, num4: number){
    return num1 + num2 + num3 + num4;
  }

  newYear(){
    let newYearId =  this.career.years[this.career.years.length - 1]?.year + 1;
    let newYear: Year = {
      id: newYearId,
      year: newYearId,
      subjects: []
    }
    this.career.years.push(newYear);
  }

  deleteYearById(yearId: number) {
    const yearIndex = this.career.years.findIndex(year => year.id === yearId);
    if (yearIndex !== -1) {
      if(!this.existYear(yearId+1)){
        this.career.years.splice(yearIndex, 1);
      }
    }
  }

  /* requirementSubjects2(subjectCode: number){

    this.career.years.forEach(year => {

        year.subjects.forEach(subject => {
          let subjectRend = this.elementRef.nativeElement.querySelector('#small' + subject.code);
          let subjectRend1 = this.elementRef.nativeElement.querySelector('#big' + subject.code);
          if (subject.id !== subjectCode && subject.requirement.includes(subjectCode)){
              this.renderer.addClass(subjectRend, 'highlight-important');
              this.renderer.addClass(subjectRend1, 'highlight-important');
          }
        });
    });
  } */
}