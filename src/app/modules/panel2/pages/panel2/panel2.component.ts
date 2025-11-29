import { Location } from '@angular/common';
import { Component, ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../auth.service';
import { Career, Subject, Year } from '../../../../interfaces/Career';

@Component({
  selector: 'app-panel2',
  templateUrl: './panel2.component.html',
  styleUrl: './panel2.component.scss'
})
export class Panel2Component {

  subs: Subscription = new Subscription();
  showSubjectInformation: string = "";
  numberGroup: number = 0;
  numberGroupRequirement: number = 0;
  numberRequirement: number = 0;
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
            critic: false,
            career_id: 0,
          }
        ],
        career_id: 0,
        career_name: ""
      }]
    };
  careerBack!: Career;

  constructor(
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

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

  goBack(): void {
    this.location.back();
  }
  
  newYear(){
    let newYearId =  this.career.years[this.career.years.length - 1]?.year + 1;
    let newYear: Year = {
      id: newYearId,
      year: newYearId,
      subjects: [],
      career_id: 0,
      career_name: ""
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

  subjectStyle(subject: Subject, year: Year){
    
    let quarts: number [] = subject.quarts;
    let border = 'none';
    let boxShadow = 'none';
    let backgroundColor = "#007e67";
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
    if(quarts[0] === 4){
      marginLeft = '76%'
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

    
    if(this.isRequirement(subject, year)){
      border = 'solid 5px #ff0000ff'
      boxShadow = '0 0 0 1px #000000ff';
    }

    if(subject.group.length > 0){
      if(this.numberGroup === subject.group[0].id){
        border = 'solid 5px #a6ff00ff'
        boxShadow = '0 0 0 1px #000000ff';
      }
    }

    if(subject.fail){
      //backgroundColor = "#8d0044ff";
      //this.updateIntrusoColors();
      
    }

    if(subject.critic){
      backgroundColor = "#d7531b";
    }
    
    if(subject.validate === true){
      backgroundColor = "#687d7f"
    }
    
    

    return {
      marginLeft: marginLeft,
      width: width,
      backgroundColor: backgroundColor,
      border: border,
      boxShadow: boxShadow
    };
  }

  updateIntrusoColors(): void {
  // 1️⃣ Limpiar todos los subjects primero
  for (let year of this.career.years) {
    for (let subj of year.subjects) {
      let el = document.getElementById('sub' + subj.id);
      if (el) el.style.backgroundColor = ''; // reset
    }
  }

  // 2️⃣ Recalcular intrusos y cadenas
  this.findIntrusoGroups();

  // 3️⃣ Aplicar colores
  this.applyIntrusoColors();

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

  existYear(yearId: number){
    return this.career.years.some(year => year.year === yearId)
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
  }

  /* si es requerido */
  isRequirement(subject: Subject, year: Year): boolean {
    let yearNumber = year.year;
    
    for (let y of this.career.years) {
      for (let subj of y.subjects) {
        for (let requirement of subj.requirements) {
          if (requirement === subject.id && y.year <= yearNumber && !subject.validate && !subj.validate ) {
            return true
          }
        }
        for(let requirement of subject.requirements){
          if(requirement === subj.id && y.year >= yearNumber && !subject.validate && !subj.validate){
            return true
          }
        }
      }
    }

    return false;
  }

  getGroupRequirements(subject: Subject){
    let res = 0;
    for(let years of this.career.years){
      for(let subj of years.subjects){
        for(let requirement of subj.requirements){
          if(subject.id === requirement){
            return subj.id;
          }
            
        }
      }
    }
    return 0
  }

  /*  validaciones */
  validate(subject: Subject){
    subject.validate = !subject.validate;
  }

  /*paint group */
  paintGroup(subject: Subject){
    this.numberGroup = subject.group[0].id
  }

  /* calcular horas de los quarts*/
  allHoursQuarts(subjects: Subject[], i: number){
    let res: number = 0;
    for (let subject of subjects) {
      if(subject.validate == false){
        res = this.hoursQuart(subject.quarts, subject.credit)[i] + res;
      }
    }
    return parseFloat(res.toFixed(0));
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

  suma(year: Year){
    let res = 0;
    year.subjects.forEach( subject => {
      if(!subject.validate)
      res = res + subject.credit;
    });
    return res;
  }

intrusoGroupsWithColors: { intruso: Subject, chain: Subject[], color: string }[] = [];

findIntrusoGroups(): void {
  let groups: { intruso: Subject, chain: Subject[] }[] = [];

  // Recorrer todos los años y subjects
  for (let year of this.career.years) {
    let subjects = year.subjects;

    for (let intruso of subjects) {
      for (let possible of subjects) {
        // mismo año y posible requiere al intruso
        if (possible.requirements.includes(intruso.id)) {

          let chainIds = [intruso.id, ...this.getForwardChain(intruso)];
          let chainSubjects = chainIds
            .map(id => this.findSubjectById(id))
            .filter(s => s !== undefined) as Subject[];

          groups.push({ intruso, chain: chainSubjects });
        }
      }
    }
  }

  // Asignar colores
  let colors = ['#8d0044ff', '#8b522fff', '#b99e33ff', '#cb459eff', '#ff2626ff', '#f16e1cff'];
  this.intrusoGroupsWithColors = groups.map((group, index) => ({
    intruso: group.intruso,
    chain: group.chain,
    color: colors[index % colors.length]
  }));

  /* console.log("Intruso groups with colors:", intrusoGroupsWithColors); */
}

getForwardChain(subject: Subject): number[] {
  let visited = new Set<number>();
  let result: number[] = [];

  let recurse = (current: Subject) => {
    if (visited.has(current.id)) return;
    visited.add(current.id);

    for (let year of this.career.years) {
      for (let subj of year.subjects) {
        if (subj.requirements.includes(current.id)) {
          result.push(subj.id);
          recurse(subj);
        }
      }
    }
  };

  recurse(subject);
  return result;
}

findSubjectById(id: number): Subject | undefined {
  for (let year of this.career.years) {
    let s = year.subjects.find(subj => subj.id === id);
    if (s) return s;
  }
  return undefined;
}

lightenColor(hex: string, percent: number): string {
  let r = parseInt(hex.slice(1,3), 16);
  let g = parseInt(hex.slice(3,5), 16);
  let b = parseInt(hex.slice(5,7), 16);

  r = Math.min(255, Math.floor(r + (255 - r) * percent));
  g = Math.min(255, Math.floor(g + (255 - g) * percent));
  b = Math.min(255, Math.floor(b + (255 - b) * percent));

  return `rgb(${r},${g},${b})`;
}

applyIntrusoColors(): void {
  for (let group of this.intrusoGroupsWithColors) {

    // 1️⃣ Pintar el intruso (clase: "sub{id}")
    let intrusoEls = document.getElementsByClassName('sub' + group.intruso.id);
    for (let el of Array.from(intrusoEls)) {
      (el as HTMLElement).style.backgroundColor = group.color;
    }

    // 2️⃣ Pintar chain con color más claro
    for (let subj of group.chain) {
      if (subj.id === group.intruso.id) continue;

      let relatedEls = document.getElementsByClassName('sub' + subj.id);
      for (let el of Array.from(relatedEls)) {
        (el as HTMLElement).style.backgroundColor = this.lightenColor(group.color, 0.5);
      }
    }

  }
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
  }

  addFail(subject: Subject, year: Year) {
    // Crear una copia del subject y modificar su id y fail
    let subjectNew: Subject = { ...subject };
    subjectNew.id = subject.id;
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
  
    setTimeout(() => {
      this.updateIntrusoColors();
      let intrusoEls = document.getElementsByClassName('sub' + subject.id);
      for (let el of Array.from(intrusoEls)) {
        (el as HTMLElement).style.backgroundColor = '#8d0044ff';
      }
    }, 0.1);
        
  }
  

  deleteFail(subject: Subject, year: Year) {
  this.deleteFailAsync(subject, year).then(() => {
    this.updateIntrusoColors();
  });
}

deleteFailAsync(subject: Subject, year: Year): Promise<void> {
  return new Promise((resolve) => {
    let subjectNew: Subject = { ...subject };
    subjectNew.id = subject.id;

    this.career.years.forEach(yea => {
      if (yea.year > year.year) {
        yea.subjects = yea.subjects.filter(sub => sub.name !== subject.name);
      }
    });

    subject.fail = !subject.fail;

    resolve(); // marca que la promesa terminó
  });
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
  }

}
