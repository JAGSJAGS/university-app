import { Component, ElementRef, Renderer2 } from '@angular/core';
import { Career, Subject, Year } from '../../../../interfaces/Career';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.scss'
})
export class PanelComponent {

  career!: Career;

  list1 = ['Get to workfdasfda'];

  constructor(
    private elementRef: ElementRef, 
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    
  }
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

  changeStyle(quarts: string[]) {
    let sizeQuart = Number(quarts[1]) - Number(quarts[0]);
    let width = '24%'
    let marginLeft = '0%'
    if(quarts[0] === "1"){
      marginLeft = '0%'
    }
    if(quarts[0] === "2"){
      marginLeft = '26%'
    }
    if(quarts[0] === "3"){
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

  showSubject(code: String, num: number){
    let subject = this.elementRef.nativeElement.querySelector('#small' + code);
    let subjectAll = this.elementRef.nativeElement.querySelector('#big' + code);
    console.log(code);
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

  hoursQuart(quarts: string[], hours: number){
    let sizeQuart: number = Number(quarts[1]) - Number(quarts[0])+1;
    let hoursQuarts: number = (hours/sizeQuart);
    let i = Number(quarts[0]) - 1;
    let j = Number(quarts[1]) - 1;
    let hoursPeriod: number[] = [0,0,0,0];
    while(i <= j){
      hoursPeriod[i] = hoursQuarts;
      i= i + 1;
    }
    return hoursPeriod;
  }

  allHoursQuarts(subjects: Subject[], i: number){
    let res: number = 0;
    for (let subject of subjects) {
      if(subject.validate == false){
        res = this.hoursQuart(subject.quarts, 20)[i] + res;
      }
    }
    return Math.trunc(res);
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

  validate(yearId: number, subjectCode: string){
    this.career.years.forEach(year => {
      if (year.year === yearId) {
        year.subjects.forEach(subject =>{
          if(subject.code == subjectCode){
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

  moveSubjectYear(subjectCode: string, yearId: number, position: string){
    if(position === "right"){
      if(this.existYear(yearId + 1)){
        this.deleteSubjectYear(subjectCode, yearId, yearId + 1)
      }
    }
    else{
      if(this.existYear(yearId - 1)){
        this.deleteSubjectYear(subjectCode, yearId, yearId - 1)
      }
    }
  }

  deleteSubjectYear(subjectCode: string, yearInitialId: number, yearFinalId: number){
    let subjectToMove: any = null;

    // Buscar y eliminar el subject del año actual
    this.career.years.forEach(year => {
      if (year.year === yearInitialId) {
        const subjectIndex = year.subjects.findIndex(subject => subject.code === subjectCode);
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

  newYear(){
    let newYearId =  this.career.years[this.career.years.length - 1]?.year + 1;
    let newYear: Year = {
      year: newYearId,
      subjects: []
    }
    this.career.years.push(newYear);
  }

  deleteYearById(yearId: number) {
    const yearIndex = this.career.years.findIndex(year => year.year === yearId);
    if (yearIndex !== -1) {
        this.career.years.splice(yearIndex, 1);
    }
  }
}
