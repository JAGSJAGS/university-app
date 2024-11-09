import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { Career, Group, Subject, Year } from '../../../../interfaces/Career';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../auth.service';
import { Subscription } from 'rxjs';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.scss'
})
export class PanelComponent{

  @ViewChild('contentToConvert') contentToConvert!: ElementRef;

  subs: Subscription = new Subscription();

  showSubjectInformation: string = "";
  //private unlisten: () => void;

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
          link: "",
          fail: false,
          requirements:  [],
          credit: 0,
          group: [{
            id: 0,
            name: ""
          }],
          groups: [],
          critic: false
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
  ) { 
    /* this.unlisten = this.renderer.listen('document', 'DOMContentLoaded', () => {
      this.ifs();
    }); */
  }

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
        this.table();
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

  table(){
    setTimeout(() => {
      this.iff();
    }, 10);
  }

  iff(){
    this.career.years.forEach(year => {
      year.subjects.forEach(subject => {
        let subjectRender = this.elementRef.nativeElement.querySelector('#' + 'sub' + subject.id);
        subjectRender.style.backgroundColor = '#007e67';

        
        if(subject.validate){
          let subjectRender = this.elementRef.nativeElement.querySelector('#' + 'sub' + subject.id);
          subjectRender.style.backgroundColor = '#687d7f';
        }
        else{
          if(this.ifIsSameGroup(year.id, subject)){
            let subjectRender = this.elementRef.nativeElement.querySelector('#' + 'sub' + subject.id);
            subjectRender.style.backgroundColor = '#b15e5192';
          }
        }
        if(subject.critic){
          let subjectRender = this.elementRef.nativeElement.querySelector('#' + 'sub' + subject.id);
          subjectRender.style.backgroundColor = '#d7531b';
        }

        if(subject.fail){
          let subjectRender = this.elementRef.nativeElement.querySelector('#' + 'sub' + subject.id);
          subjectRender.style.backgroundColor = '#850000';
        }
      })
    });
  }

  ifIsSameGroup(yearId: number, subject: Subject): boolean {
    // Retorna true si subject.validate es falso
    
    // Retorna true si encuentra un grupo coincidente y `otherSubject.validate` es falso
    return this.career.years.some(year => 
      year.id !== yearId && 
      year.subjects.some(otherSubject => 
        ((!otherSubject.validate &&
          otherSubject.group.length > 0 &&
          otherSubject.group.some(group => group.id === subject.group[0]?.id)
        ))
      )
    );
    
  }

  validate(subject: Subject){
    
    subject.validate = !subject.validate;
    this.table();
  }

  paintValidateGroup(subject: Subject) {
    this.career.years.forEach(yea => {
      yea.subjects.forEach(otherSubject => {
        if(otherSubject.group.some(group => group.id === subject.group[0].id)){
          if(subject.validate){
            let subjectRender = this.elementRef.nativeElement.querySelector('#' + 'sub' + otherSubject.id);
            subjectRender.style.backgroundColor = '#00ae8e';
          }
          else{
            if(this.ifIsSameGroup(yea.id, subject)){
              let subjectRender = this.elementRef.nativeElement.querySelector('#' + 'sub' + otherSubject.id);
              subjectRender.style.backgroundColor = '#b15e5192';
            
            }
            else{
              let subjectRender = this.elementRef.nativeElement.querySelector('#' + 'sub' + otherSubject.id);
              subjectRender.style.backgroundColor = '#00ae8e';
            }
          }
        }
      })
    });
  }

  unpaintValidateGroup(subject: Subject){
    this.career.years.forEach(yea => {
      yea.subjects.forEach(otherSubject => {
        if(otherSubject.group.some(group => group.id === subject.group[0].id)){
          let subjectRender = this.elementRef.nativeElement.querySelector('#' + 'sub' + otherSubject.id);
          subjectRender.style.backgroundColor = '#00ae8e';
        }
      })
    });
  }

  critic(subject: Subject, year: Year) {
    // Alternar el valor de critic en el subject original
    subject.critic = !subject.critic;
  
    // Encontrar el índice del año actual y del año siguiente
    const currentYearIndex = this.career.years.findIndex(y => y.year === year.year);
    const nextYearIndex = currentYearIndex + 1;
  
    // Verificar que el siguiente año exista
    if (nextYearIndex < this.career.years.length) {
      const currentYear = this.career.years[currentYearIndex];
      const nextYear = this.career.years[nextYearIndex];
  
      // Encontrar el índice del subject en el año actual
      const subjectIndex = currentYear.subjects.findIndex(sub => sub.id === subject.id);
  
      if (subjectIndex !== -1) {
        // Remover el subject del año actual
        currentYear.subjects = currentYear.subjects.filter(sub => sub.id !== subject.id);
  
        // Insertar el subject en el mismo índice en el año siguiente o al final si el índice es mayor
        nextYear.subjects.splice(Math.min(subjectIndex, nextYear.subjects.length), 0, subject);
      }
    }
  
    // Llamada para actualizar la tabla o vista
    this.table();
  }

  noCritic(subject: Subject, year: Year) {
    // Alternar el valor de critic en el subject original
    subject.critic = !subject.critic;
  
    // Encontrar el índice del año actual y del año anterior
    const currentYearIndex = this.career.years.findIndex(y => y.year === year.year);
    const previousYearIndex = currentYearIndex - 1;
  
    // Verificar que el año anterior exista
    if (previousYearIndex >= 0) {
      const currentYear = this.career.years[currentYearIndex];
      const previousYear = this.career.years[previousYearIndex];
  
      // Encontrar el índice del subject en el año actual
      const subjectIndex = currentYear.subjects.findIndex(sub => sub.id === subject.id);
  
      if (subjectIndex !== -1) {
        // Remover el subject del año actual
        currentYear.subjects = currentYear.subjects.filter(sub => sub.id !== subject.id);
  
        // Insertar el subject en el mismo índice en el año anterior o al final si el índice es mayor
        previousYear.subjects.splice(Math.min(subjectIndex, previousYear.subjects.length), 0, subject);
      }
    }
  
    // Llamada para actualizar la tabla o vista
    this.table();
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

  paintGroupSubject(groupf: Group[], year_id: number){
    if(groupf.length > 0){
      this.career.years.forEach(yea => {
          yea.subjects.forEach(subject => {
            if(subject.group.some(group => group.id === groupf[0].id)){
              this.paintBorderSubject(subject.id)
            }
          })
      });
    }
  }

  paintBorderSubject(subjectId: number){
    let subject = this.elementRef.nativeElement.querySelector('#' + 'sub' + subjectId);
    //let subject2 = this.elementRef.nativeElement.querySelector('#' + 'big' + subjectId);
    this.renderer.setStyle(subject, 'border', 'solid 2px #ffff00');
    //this.renderer.setStyle(subject2, 'border', 'solid 2px #ffff00');
  }

  unPaintGroupSubject(groupf: Group[], year_id: number){
    if(groupf.length > 0){
      this.career.years.forEach(yea => {
          yea.subjects.forEach(subject => {
            if(subject.group.some(group => group.id === groupf[0].id)){
              this.unPaintBorderSubject(subject.id)
            }
          })
      });
    }
  }

  unPaintBorderSubject(subjectCode: number){
    let subject = this.elementRef.nativeElement.querySelector('#' + 'sub' + subjectCode);
    //let subject2 = this.elementRef.nativeElement.querySelector('#' + 'big' + subjectCode);
    this.renderer.setStyle(subject, 'border', 'none');
    //this.renderer.setStyle(subject2, 'border', 'none');
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
    this.table;
  }

  moveRigth(subject: Subject, year: Year){
      // Encuentra el índice del año actual en la lista de años
    const currentYearIndex = this.career.years.findIndex(y => y.year === year.year);
    const nextYearIndex = currentYearIndex + 1;

    // Verifica que el año siguiente exista
    if (nextYearIndex < this.career.years.length) {
      const currentYear = this.career.years[currentYearIndex];
      const nextYear = this.career.years[nextYearIndex];

      // Encuentra el índice del subject en el año actual
      const subjectIndex = currentYear.subjects.findIndex(sub => sub.id === subject.id);

      if (subjectIndex !== -1) {
        // Remueve el subject del año actual
        currentYear.subjects.splice(subjectIndex, 1);

        // Inserta el subject en el mismo índice en el año siguiente, o al final si el índice es mayor
        nextYear.subjects.splice(Math.min(subjectIndex, nextYear.subjects.length), 0, subject);
      }
    }
    this.table();
  }

  moveLeft(subject: Subject, year: Year) {
    // Encuentra el índice del año actual en la lista de años
    const currentYearIndex = this.career.years.findIndex(y => y.year === year.year);
    const previousYearIndex = currentYearIndex - 1;
  
    // Verifica que el año anterior exista
    if (previousYearIndex >= 0) {
      const currentYear = this.career.years[currentYearIndex];
      const previousYear = this.career.years[previousYearIndex];
  
      // Encuentra el índice del subject en el año actual
      const subjectIndex = currentYear.subjects.findIndex(sub => sub.id === subject.id);
  
      if (subjectIndex !== -1) {
        // Remueve el subject del año actual
        currentYear.subjects.splice(subjectIndex, 1);
  
        // Inserta el subject en el mismo índice en el año anterior, o al final si el índice es mayor
        previousYear.subjects.splice(Math.min(subjectIndex, previousYear.subjects.length), 0, subject);
      }
    }
  
    this.table();
  }

  existSubject(subject: Subject, year: Year){
    return this.career.years.some(yea => 
      yea.year === year.year - 1 && 
      !yea.subjects.some(sub => sub.name === subject.name)
    );
  }

  paint(){
    this.career.years.forEach(year => {
      // Copiamos los subjects como array, no objeto
      let subjects = [...year.subjects]; // Asegúrate de que 'year.subjects' sea un array
      year.subjects.forEach(subject => {
        for (let sub of subjects) {
          if (sub.requirements.includes(subject.id)) {
            let subjectRend = this.elementRef.nativeElement.querySelector('#sub' + subject.id);
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

  fail(subject: Subject, year: Year){
    //this.changeBooleanFail(subject);
    if(!subject.fail){
      if(this.existYear(year.year + 1)){
        this.addFail(subject, year);
      }
    }
    else{
      this.deleteFail(subject, year)
    }
    this.table();
  }

  addFail(subject: Subject, year: Year) {
    // Crear una copia del subject y modificar su id y fail
    let subjectNew: Subject = { ...subject };
    subjectNew.id = subject.id * (1000 + year.year);
    subjectNew.fail = false;
  
    // Encontrar el índice del año actual y del año siguiente
    const currentYearIndex = this.career.years.findIndex(y => y.year === year.year);
    const nextYearIndex = currentYearIndex + 1;
  
    // Verificar que el siguiente año exista
    if (nextYearIndex < this.career.years.length) {
      const currentYear = this.career.years[currentYearIndex];
      const nextYear = this.career.years[nextYearIndex];
  
      // Encontrar el índice del subject en el año actual
      const subjectIndex = currentYear.subjects.findIndex(sub => sub.id === subject.id);
  
      if (subjectIndex !== -1) {
        // Insertar el nuevo subject en el mismo índice en el año siguiente o al final si el índice es mayor
        nextYear.subjects.splice(Math.min(subjectIndex, nextYear.subjects.length), 0, subjectNew);
        
        // Alternar el valor de fail en el subject original
        subject.fail = !subject.fail;
      }
    }
  
    console.log('select', subjectNew.id);
  }
  

  deleteFail(subject: Subject, year: Year){
    let subjectNew: Subject = {...subject}
    subjectNew.id = subject.id *(1000 + year.year);
    this.career.years.forEach(yea => {
      if(yea.year > year.year){
        yea.subjects = yea.subjects.filter(sub => sub.name !== subject.name);
      }
    });
    subject.fail = !subject.fail;
  }

  paintSubjecFail(subjectCode: number, fail: boolean){
    let subjectRend = this.elementRef.nativeElement.querySelector('#sub' + subjectCode);
    let subjectRend1 = this.elementRef.nativeElement.querySelector('#big' + subjectCode);
  }

  requirementSubject(subjectCode: number, fail: boolean){

    this.career.years.forEach(year => {

        year.subjects.forEach(subject => {
          let subjectRend = this.elementRef.nativeElement.querySelector('#sub' + subject.id);
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

  changeBooleanFail(subject: Subject) {
    this.career.years.forEach(year => {
      year.subjects.forEach(subjec => {
        if (subjec.id === subject.id) {
          subjec.fail = !subjec.fail; // Invierte el valor de fail directamente
        }
      });
    });
    this.table();
  }

  allHoursQuarts(subjects: Subject[], i: number){
    let res: number = 0;
    for (let subject of subjects) {
      if(subject.validate == false){
        res = this.hoursQuart(subject.quarts, subject.credit)[i] + res;
      }
    }
    return parseFloat(res.toFixed(2));
  }

  hoursQuart(quarts: number[], hours: number){
    let sizeQuart: number = quarts[1] - quarts[0]+1;
    let hoursQuarts: number = (hours/sizeQuart);
    let i = quarts[0] - 1;
    let j = quarts[1] - 1;
    let hoursPeriod: number[] = [0,0,0,0];
    while(i <= j){
      hoursPeriod[i] = hoursQuarts;
      i = i + 1;
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

  public exportDivToPDF(): void {
    let data = document.getElementById('htmlContent'); // Selecciona el div con contenido desplazable
    let margin = 10; // Margen en milímetros
  
    if (data) {
      html2canvas(data, {
        scrollX: 0,
        scrollY: 0,
        width: data.scrollWidth,    // Usa el ancho completo del contenido
        height: data.scrollHeight,   // Usa la altura completa del contenido
        useCORS: true                // Habilita CORS si hay recursos externos
      }).then(canvas => {
        let contentDataURL = canvas.toDataURL('image/png', 1.0);
  
        // Crear un nuevo PDF usando jsPDF con orientación horizontal
        let pdf = new jsPDF('l', 'mm', 'a4');
  
        // Obtener dimensiones del PDF y restar los márgenes
        let pdfWidth = pdf.internal.pageSize.getWidth() - 2 * margin;
        let pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  
        // Añadir la imagen al PDF con margen
        pdf.addImage(contentDataURL, 'PNG', margin, margin, pdfWidth, pdfHeight);
  
        // Guardar el PDF generado
        pdf.save('file.pdf');
      }).catch(error => {
        console.error('Error al exportar el contenido como PDF:', error);
      });
    }
  }
}