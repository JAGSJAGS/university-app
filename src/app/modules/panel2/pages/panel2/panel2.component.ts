import { Location } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../auth.service';
import { Career, Subject, Year } from '../../../../interfaces/Career';
import {
  buildColumns,
  clearFailure,
  CREDITS_MAX,
  dropSubject,
  failSubject,
  moveSubject,
  neighbourYear,
  nextYearNumber,
  QUARTS,
  SubjectCard,
  toggleCritic,
  YearColumn
} from './panel2.logic';

/** Con ratón el arrastre empieza al mover este número de píxeles. */
const MOUSE_THRESHOLD = 4;
/** Con el dedo hay que mantener pulsado (así el scroll normal sigue funcionando). */
const LONG_PRESS_MS = 350;
/** Si el dedo se mueve más que esto antes del long-press, es un scroll y no un arrastre. */
const TOUCH_TOLERANCE = 10;
/** Distancia al borde del scroller a partir de la cual se desplaza solo. */
const EDGE_SIZE = 64;
const EDGE_MAX_SPEED = 24;

/** Estado de un arrastre en curso (o a la espera de que empiece). */
interface DragState {
  card: SubjectCard;
  pointerId: number;
  pointerType: string;
  startX: number;
  startY: number;
  /** Posición actual del puntero. */
  x: number;
  y: number;
  /** Dónde se agarró la tarjeta, para que el "fantasma" no salte. */
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  active: boolean;
  timer: ReturnType<typeof setTimeout> | null;
}

/** Dónde caería la materia si se soltara ahora. */
interface DropTarget {
  year: Year;
  /** Posición dentro de las materias del año (antes de sacar la que se arrastra). */
  index: number;
  /** Altura de la línea indicadora, en píxeles desde el borde superior del cuerpo de la columna. */
  top: number;
}

@Component({
  selector: 'app-panel2',
  templateUrl: './panel2.component.html',
  styleUrl: './panel2.component.scss'
})
export class Panel2Component implements OnInit, OnDestroy {

  @ViewChild('scroller') scroller?: ElementRef<HTMLElement>;

  readonly quarts = QUARTS;
  readonly creditsMax = CREDITS_MAX;

  career: Career | null = null;
  /** Todo lo que se pinta; se recalcula en `refresh()` cada vez que cambia algo. */
  columns: YearColumn[] = [];

  loading = true;
  loadError = false;
  exporting = false;
  /** Hay cambios de la simulación que se perderían al recargar. */
  dirty = false;

  /** Materia con el panel de detalle abierto y materia bajo el ratón. */
  selectedSubject: Subject | null = null;
  selectedCard: SubjectCard | null = null;
  hovered: SubjectCard | null = null;

  /** Arrastre en curso y sitio donde caería la materia. */
  drag: DragState | null = null;
  dropTarget: DropTarget | null = null;

  private careerId = 0;
  private subs = new Subscription();
  private suppressClick = false;
  private rafId = 0;

  constructor(
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private translate: TranslateService,
    private host: ElementRef<HTMLElement>
  ) {}

  ngOnInit(): void {
    // Con el arrastre activo hay que impedir que el dedo desplace la página.
    // Tiene que ser un listener no pasivo, por eso no se puede poner con @HostListener.
    document.addEventListener('touchmove', this.blockTouchScroll, { passive: false });
    this.subs.add(this.activatedRoute.params.subscribe(({ id }) => {
      this.careerId = Number(id);
      this.load();
    }));
  }

  ngOnDestroy(): void {
    document.removeEventListener('touchmove', this.blockTouchScroll);
    this.endDrag();
    this.subs.unsubscribe();
  }

  // ---------------------------------------------------------------------------
  // Carga
  // ---------------------------------------------------------------------------

  private load(): void {
    this.loading = true;
    this.loadError = false;
    this.subs.add(this.authService.getCareer(this.careerId).subscribe({
      next: (response) => {
        const data: Career = response.data;
        // Los años se muestran de menor a mayor
        this.career = { ...data, years: [...(data.years ?? [])].sort((a, b) => a.year - b.year) };
        this.dirty = false;
        this.selectedSubject = null;
        this.loading = false;
        this.refresh();
      },
      error: () => {
        this.career = null;
        this.dirty = false;
        this.loading = false;
        this.loadError = true;
        this.refresh();
      }
    }));
  }

  reload(): void {
    if (this.dirty && !window.confirm(this.translate.instant('PANEL.CONFIRM_RELOAD'))) {
      return;
    }
    this.endDrag();
    this.load();
  }

  goBack(): void {
    this.location.back();
  }

  // ---------------------------------------------------------------------------
  // Estado derivado
  // ---------------------------------------------------------------------------

  private refresh(): void {
    this.columns = this.career ? buildColumns(this.career.years) : [];
    this.selectedCard = this.findCard(this.selectedSubject);
    if (!this.selectedCard) {
      this.selectedSubject = null;
    }
    this.hovered = null;
  }

  /** Aplica un cambio de la simulación y recalcula. */
  private changed(): void {
    this.dirty = true;
    this.refresh();
  }

  private findCard(subject: Subject | null): SubjectCard | null {
    if (!subject) {
      return null;
    }
    for (const column of this.columns) {
      const card = column.cards.find(c => c.subject === subject);
      if (card) {
        return card;
      }
    }
    return null;
  }

  /** Resalta las materias que comparten grupo con la que está bajo el ratón (o seleccionada). */
  isGroupMatch(card: SubjectCard): boolean {
    const source = this.hovered ?? this.selectedCard;
    if (!source || source.groupIds.length === 0) {
      return false;
    }
    return card.groupIds.some(id => source.groupIds.includes(id));
  }

  // ---------------------------------------------------------------------------
  // Selección
  // ---------------------------------------------------------------------------

  toggleSelect(card: SubjectCard): void {
    // Al soltar una tarjeta arrastrada el navegador también dispara un "click"
    if (this.suppressClick) {
      return;
    }
    this.selectedSubject = this.selectedSubject === card.subject ? null : card.subject;
    this.selectedCard = this.findCard(this.selectedSubject);
  }

  /** Clic en el fondo del tablero. */
  onBoardClick(): void {
    if (!this.suppressClick) {
      this.closeDetails();
    }
  }

  closeDetails(): void {
    this.selectedSubject = null;
    this.selectedCard = null;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.drag) {
      this.endDrag();
    } else {
      this.closeDetails();
    }
  }

  // ---------------------------------------------------------------------------
  // Acciones sobre una materia
  // ---------------------------------------------------------------------------

  toggleValidate(card: SubjectCard): void {
    card.subject.validate = !card.subject.validate;
    this.changed();
  }

  move(card: SubjectCard, dir: 1 | -1): void {
    if (!this.career) {
      return;
    }
    if (moveSubject(card.subject, card.year, neighbourYear(this.career.years, card.year, dir))) {
      this.changed();
    }
  }

  critic(card: SubjectCard): void {
    if (!this.career) {
      return;
    }
    toggleCritic(this.career.years, card.year, card.subject);
    this.changed();
  }

  markFailed(card: SubjectCard): void {
    if (this.career && failSubject(this.career.years, card.year, card.subject)) {
      this.changed();
    }
  }

  clearFailed(card: SubjectCard): void {
    if (!this.career) {
      return;
    }
    clearFailure(this.career.years, card.year, card.subject);
    this.changed();
  }

  // ---------------------------------------------------------------------------
  // Drag and drop (eventos de puntero: funciona igual con ratón, dedo y lápiz)
  // ---------------------------------------------------------------------------

  isDragging(card: SubjectCard): boolean {
    return !!this.drag?.active && this.drag.card.subject === card.subject;
  }

  onPointerDown(event: PointerEvent, card: SubjectCard): void {
    if (!card.movable || this.drag || this.exporting) {
      return;
    }
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    const tile = (event.currentTarget as HTMLElement).closest('.subject') as HTMLElement | null;
    const rect = (tile ?? (event.currentTarget as HTMLElement)).getBoundingClientRect();

    const drag: DragState = {
      card,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
      active: false,
      timer: null
    };
    // Con ratón se arrastra al mover; con el dedo, tras mantener pulsado
    if (event.pointerType !== 'mouse') {
      drag.timer = setTimeout(() => this.startDrag(drag), LONG_PRESS_MS);
    }
    this.drag = drag;
  }

  /** Evita el menú contextual del long-press mientras se espera o se arrastra. */
  onContextMenu(event: Event): void {
    if (this.drag) {
      event.preventDefault();
    }
  }

  @HostListener('document:pointermove', ['$event'])
  onPointerMove(event: PointerEvent): void {
    const d = this.drag;
    if (!d || event.pointerId !== d.pointerId) {
      return;
    }
    d.x = event.clientX;
    d.y = event.clientY;

    if (!d.active) {
      const distance = Math.hypot(d.x - d.startX, d.y - d.startY);
      if (d.pointerType === 'mouse') {
        if (distance >= MOUSE_THRESHOLD) {
          this.startDrag(d);
        }
      } else if (distance > TOUCH_TOLERANCE) {
        // El dedo se movió antes del long-press: es un scroll, no un arrastre
        this.endDrag();
      }
      return;
    }
    this.updateTarget();
  }

  @HostListener('document:pointerup', ['$event'])
  onPointerUp(event: PointerEvent): void {
    const d = this.drag;
    if (!d || event.pointerId !== d.pointerId) {
      return;
    }
    if (!d.active) {
      this.endDrag();
      return;
    }
    d.x = event.clientX;
    d.y = event.clientY;
    this.updateTarget();
    const target = this.dropTarget;
    const card = d.card;
    this.endDrag();
    if (target && dropSubject(card.subject, card.year, target.year, target.index)) {
      this.changed();
    }
  }

  @HostListener('document:pointercancel', ['$event'])
  onPointerCancel(event: PointerEvent): void {
    if (this.drag && event.pointerId === this.drag.pointerId) {
      this.endDrag();
    }
  }

  private readonly blockTouchScroll = (event: TouchEvent): void => {
    if (this.drag?.active && event.cancelable) {
      event.preventDefault();
    }
  };

  private startDrag(d: DragState): void {
    if (this.drag !== d || d.active) {
      return;
    }
    if (d.timer) {
      clearTimeout(d.timer);
      d.timer = null;
    }
    d.active = true;
    navigator.vibrate?.(15);
    this.updateTarget();
    this.rafId = requestAnimationFrame(this.autoScroll);
  }

  /** Termina (o cancela) el arrastre y deja todo limpio. */
  private endDrag(): void {
    const d = this.drag;
    if (!d) {
      return;
    }
    if (d.timer) {
      clearTimeout(d.timer);
    }
    cancelAnimationFrame(this.rafId);
    this.drag = null;
    this.dropTarget = null;
    if (d.active) {
      // El "click" que llega justo después de soltar no debe seleccionar la materia
      this.suppressClick = true;
      setTimeout(() => (this.suppressClick = false), 50);
    }
  }

  /** Desplaza el tablero cuando se arrastra cerca del borde izquierdo o derecho. */
  private readonly autoScroll = (): void => {
    const d = this.drag;
    const el = this.scroller?.nativeElement;
    if (!d?.active || !el) {
      return;
    }
    const box = el.getBoundingClientRect();
    let speed = 0;
    if (d.x < box.left + EDGE_SIZE) {
      speed = -(box.left + EDGE_SIZE - d.x) / 3;
    } else if (d.x > box.right - EDGE_SIZE) {
      speed = (d.x - (box.right - EDGE_SIZE)) / 3;
    }
    speed = Math.max(-EDGE_MAX_SPEED, Math.min(EDGE_MAX_SPEED, Math.round(speed)));
    if (speed) {
      el.scrollLeft += speed;
      this.updateTarget();
    }
    this.rafId = requestAnimationFrame(this.autoScroll);
  };

  private updateTarget(): void {
    const d = this.drag;
    this.dropTarget = d?.active ? this.locate(d.x, d.y) : null;
  }

  /** Busca la columna bajo el puntero y la posición de inserción entre sus materias. */
  private locate(x: number, y: number): DropTarget | null {
    const sections = this.host.nativeElement.querySelectorAll<HTMLElement>('.year-column');
    for (let i = 0; i < sections.length; i++) {
      const box = sections[i].getBoundingClientRect();
      if (x < box.left || x > box.right || y < box.top || y > box.bottom) {
        continue;
      }
      const column = this.columns[i];
      const body = sections[i].querySelector<HTMLElement>('.year-column__body');
      if (!column || !body) {
        return null;
      }
      const bodyTop = body.getBoundingClientRect().top;
      const rows = Array.from(body.querySelectorAll<HTMLElement>('.subject-row'));

      let index = rows.length;
      for (let j = 0; j < rows.length; j++) {
        const r = rows[j].getBoundingClientRect();
        if (y < r.top + r.height / 2) {
          index = j;
          break;
        }
      }

      let top: number;
      if (rows.length === 0) {
        top = 12;
      } else if (index < rows.length) {
        top = rows[index].getBoundingClientRect().top - bodyTop - 2;
      } else {
        top = rows[rows.length - 1].getBoundingClientRect().bottom - bodyTop + 2;
      }
      return { year: column.year, index, top };
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // Años
  // ---------------------------------------------------------------------------

  addYear(): void {
    if (!this.career) {
      return;
    }
    const year = nextYearNumber(this.career.years);
    this.career.years.push({
      id: -year, // provisional: este año todavía no existe en el servidor
      year,
      subjects: [],
      career_id: this.career.id,
      career_name: this.career.name
    });
    this.changed();
    // El año nuevo queda a la derecha, fuera de pantalla: se desplaza hasta él
    setTimeout(() => {
      const el = this.scroller?.nativeElement;
      el?.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    });
  }

  removeYear(column: YearColumn): void {
    if (!this.career || !column.removable) {
      return;
    }
    if (column.year.subjects.length > 0 && !window.confirm(this.translate.instant('PANEL.CONFIRM_DELETE_YEAR'))) {
      return;
    }
    this.career.years.splice(this.career.years.indexOf(column.year), 1);
    this.changed();
  }

  // ---------------------------------------------------------------------------
  // PDF
  // ---------------------------------------------------------------------------

  async exportPdf(): Promise<void> {
    const content = document.getElementById('htmlContent');
    if (!content || !this.career || this.exporting) {
      return;
    }
    this.exporting = true;
    this.endDrag();
    this.closeDetails();
    try {
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        windowWidth: content.scrollWidth,
        windowHeight: content.scrollHeight,
        // En la copia que se captura se ocultan los controles (flechas, botón de borrar...)
        onclone: (clonedDocument) => {
          clonedDocument.getElementById('htmlContent')?.classList.add('is-exporting');
        }
      });

      const margin = 10;
      const pdf = new jsPDF('l', 'mm', 'a4');
      const imgWidth = pdf.internal.pageSize.getWidth() - 2 * margin;
      const usableHeight = pdf.internal.pageSize.getHeight() - 2 * margin;
      // Alto, en píxeles del canvas, que cabe en una página
      const sliceHeight = Math.floor(usableHeight * canvas.width / imgWidth);

      // Si el panel es más alto que una página, se reparte en varias
      for (let y = 0, page = 0; y < canvas.height; y += sliceHeight, page++) {
        const height = Math.min(sliceHeight, canvas.height - y);
        const slice = document.createElement('canvas');
        slice.width = canvas.width;
        slice.height = height;
        slice.getContext('2d')?.drawImage(canvas, 0, y, canvas.width, height, 0, 0, canvas.width, height);
        if (page > 0) {
          pdf.addPage();
        }
        pdf.addImage(slice.toDataURL('image/png'), 'PNG', margin, margin, imgWidth, height * imgWidth / canvas.width);
      }

      pdf.save(`${this.career.name.replace(/[\\/:*?"<>|]+/g, '_') || 'panel'}.pdf`);
    } catch (error) {
      console.error('Error al exportar el panel como PDF:', error);
    } finally {
      this.exporting = false;
    }
  }
}
