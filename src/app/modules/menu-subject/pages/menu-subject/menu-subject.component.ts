import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { Message } from 'primeng/api';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../../../../auth.service';
import { Career, Group, Subject, Year } from '../../../../interfaces/Career';
import { MenuSubjectService } from '../../menu-subject.service';

type EditorMode = 'create' | 'edit';

const emptySubject = (): Subject => ({
  id: 0,
  name: '',
  code: '',
  quarts: [1, 4],
  validate: false,
  fail: false,
  requirements: [],
  link: '',
  credit: 0,
  group: [],
  groups: [],
  critic: false,
  career_id: 0
});

const emptyYear = (): Year => ({ id: 0, year: 0, subjects: [], career_id: 0, career_name: '' });

/** El slider va de 0 a 100 y se divide en 4 tramos: cuatrimestres 1 a 4. */
const FULL_RANGE = [12.5, 87.5];
const toQuart = (value: number): number => Math.min(4, Math.max(1, Math.ceil(value / 25)));
const toSlider = (quart: number): number => (quart - 0.5) * 25;

/** El arrastre empieza al mover el puntero este número de píxeles desde el asa. */
const DRAG_THRESHOLD = 4;
/** Distancia al borde de la pantalla a partir de la cual la página se desplaza sola. */
const EDGE_SIZE = 64;
const EDGE_MAX_SPEED = 24;

/** Estado de un arrastre en curso (o a la espera de que empiece). */
interface DragState {
  subject: Subject;
  pointerId: number;
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
}

/** Dónde caería la materia si se soltara ahora. */
interface DropTarget {
  /** Posición en la lista completa (antes de sacar la materia que se arrastra). */
  index: number;
  /** Altura de la línea indicadora, en píxeles desde el borde superior de la lista. */
  top: number;
}

@Component({
  selector: 'app-menu-subject',
  templateUrl: './menu-subject.component.html',
  styleUrl: './menu-subject.component.scss'
})
export class MenuSubjectComponent implements OnInit, OnDestroy {
  subs: Subscription = new Subscription();
  showSpinner = false;

  year: Year = emptyYear();
  career: Career = { id: 0, name: '', years: [] };

  /** Materias del año, en el orden que se muestra (y se guarda). */
  subjects: Subject[] = [];
  /** Todas las materias de la carrera: sirven para elegir requisitos. */
  allSubjects: Subject[] = [];
  groups: Group[] = [];

  /** Formulario lateral: null = cerrado. Un solo formulario para crear y editar. */
  mode: EditorMode | null = null;
  form: Subject = emptySubject();
  range: number[] = [...FULL_RANGE];
  requirementIds: number[] = [];
  groupIds: number[] = [];
  nameError = false;
  creditError = false;

  /** Pendientes de confirmar el borrado (null = diálogo cerrado). */
  subjectToDelete: Subject | null = null;
  groupToDelete: Group | null = null;

  showNewGroup = false;
  newGroupName = '';
  groupNameError = false;

  messages: Message[] = [];
  showMessage = false;
  private messageTimer?: ReturnType<typeof setTimeout>;

  /** Arrastre en curso y sitio donde caería la materia. */
  drag: DragState | null = null;
  dropTarget: DropTarget | null = null;
  private rafId = 0;

  constructor(
    private authService: AuthService,
    private storage: Storage,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private menuSubjectService: MenuSubjectService,
    private host: ElementRef<HTMLElement>
  ) {}

  ngOnInit(): void {
    this.subs.add(this.route.paramMap.subscribe(params => this.load(Number(params.get('id')))));
  }

  ngOnDestroy(): void {
    clearTimeout(this.messageTimer);
    this.endDrag();
    this.subs.unsubscribe();
  }

  // ---------------------------------------------------------------------------
  // Sesión y navegación
  // ---------------------------------------------------------------------------

  logoutUser(): void {
    this.showSpinner = true;
    this.subs.add(this.authService.logOutUser().subscribe({
      next: async () => {
        // Primero se limpia la sesión: /home redirige si "authenticated" sigue en true
        await this.clearSession();
        this.showSpinner = false;
        this.router.navigate(['/home']);
      },
      error: async (error) => {
        console.log('error logOutUser:', error);
        await this.clearSession();
        this.showSpinner = false;
      }
    }));
  }

  private clearSession(): Promise<unknown> {
    return Promise.all([
      this.storage.set('authenticated', false),
      this.storage.set('access_token', '')
    ]);
  }

  goBack(): void {
    this.location.back();
  }

  // ---------------------------------------------------------------------------
  // Datos
  // ---------------------------------------------------------------------------

  /** Carga el año primero: su career_id hace falta para pedir las materias de la carrera. */
  private load(yearId: number): void {
    this.showSpinner = true;
    this.subs.add(this.menuSubjectService.getYear(yearId).pipe(
      switchMap(res => {
        this.year = res.data;
        this.career = { ...this.career, id: this.year.career_id };
        return forkJoin({
          lists: this.fetchLists(),
          groups: this.authService.getAllGroups()
        });
      })
    ).subscribe({
      next: ({ lists, groups }) => {
        this.applyLists(lists);
        this.groups = [...groups.data];
        this.showSpinner = false;
      },
      error: (error) => {
        this.showSpinner = false;
        console.log('error load:', error?.error?.message ?? error);
      }
    }));
  }

  private fetchLists() {
    return forkJoin({
      subjects: this.menuSubjectService.getSubjects(this.year),
      all: this.menuSubjectService.getAllSubjects(this.career)
    });
  }

  private applyLists(lists: { subjects: { data: Subject[] }; all: { data: Subject[] } }): void {
    this.subjects = [...lists.subjects.data];
    this.allSubjects = [...lists.all.data];
  }

  private refreshLists(): void {
    this.subs.add(this.fetchLists().subscribe({
      next: lists => this.applyLists(lists),
      error: (error) => console.log('error refreshLists:', error?.error?.message ?? error)
    }));
  }

  private getGroups(): void {
    this.subs.add(this.authService.getAllGroups().subscribe({
      next: (groups) => this.groups = [...groups.data],
      error: (error) => console.log('error getGroups:', error?.error?.message ?? error)
    }));
  }

  // ---------------------------------------------------------------------------
  // Orden (drag and drop)
  // ---------------------------------------------------------------------------

  isDragging(subject: Subject): boolean {
    return !!this.drag?.active && this.drag.subject === subject;
  }

  /** Empieza a arrastrar al mover el puntero unos píxeles desde el asa (ratón, dedo o lápiz). */
  onPointerDown(event: PointerEvent, subject: Subject): void {
    if (this.drag || (event.pointerType === 'mouse' && event.button !== 0)) {
      return;
    }
    const handle = event.currentTarget as HTMLElement;
    const rect = (handle.closest('.subject') ?? handle).getBoundingClientRect();
    this.drag = {
      subject,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
      active: false
    };
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
      if (Math.hypot(d.x - d.startX, d.y - d.startY) >= DRAG_THRESHOLD) {
        d.active = true;
        this.updateTarget();
        this.rafId = requestAnimationFrame(this.autoScroll);
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
    const from = this.subjects.indexOf(d.subject);
    this.endDrag();
    if (target && from !== -1) {
      // El índice se calculó con la lista completa: al sacar la materia, los siguientes bajan una posición
      this.moveSubject(from, target.index > from ? target.index - 1 : target.index);
    }
  }

  @HostListener('document:pointercancel', ['$event'])
  onPointerCancel(event: PointerEvent): void {
    if (this.drag && event.pointerId === this.drag.pointerId) {
      this.endDrag();
    }
  }

  /** Termina (o cancela) el arrastre y deja todo limpio. */
  private endDrag(): void {
    cancelAnimationFrame(this.rafId);
    this.drag = null;
    this.dropTarget = null;
  }

  /** Desplaza la página cuando se arrastra cerca del borde superior o inferior de la pantalla. */
  private readonly autoScroll = (): void => {
    const d = this.drag;
    if (!d?.active) {
      return;
    }
    const height = window.innerHeight;
    let speed = 0;
    if (d.y < EDGE_SIZE) {
      speed = -(EDGE_SIZE - d.y) / 3;
    } else if (d.y > height - EDGE_SIZE) {
      speed = (d.y - (height - EDGE_SIZE)) / 3;
    }
    speed = Math.max(-EDGE_MAX_SPEED, Math.min(EDGE_MAX_SPEED, Math.round(speed)));
    if (speed) {
      window.scrollBy(0, speed);
      this.updateTarget();
    }
    this.rafId = requestAnimationFrame(this.autoScroll);
  };

  private updateTarget(): void {
    const d = this.drag;
    this.dropTarget = d?.active ? this.locate(d.x, d.y) : null;
  }

  /** Busca la posición de inserción entre las materias. Fuera de la lista horizontalmente = cancelar. */
  private locate(x: number, y: number): DropTarget | null {
    const list = this.host.nativeElement.querySelector<HTMLElement>('.list');
    if (!list) {
      return null;
    }
    const box = list.getBoundingClientRect();
    if (x < box.left || x > box.right) {
      return null;
    }
    const rows = Array.from(list.querySelectorAll<HTMLElement>(':scope > .subject'));
    if (rows.length === 0) {
      return null;
    }

    let index = rows.length;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i].getBoundingClientRect();
      if (y < r.top + r.height / 2) {
        index = i;
        break;
      }
    }

    const top = index < rows.length
      ? rows[index].getBoundingClientRect().top - box.top - 4
      : rows[rows.length - 1].getBoundingClientRect().bottom - box.top + 4;
    return { index, top };
  }

  /** Mueve una materia y guarda el nuevo orden. También lo usan las flechas del teclado. */
  moveSubject(from: number, to: number): void {
    if (from === to || to < 0 || to >= this.subjects.length) {
      return;
    }
    const previous = [...this.subjects];
    this.subjects.splice(to, 0, this.subjects.splice(from, 1)[0]);

    // Sin spinner a pantalla completa: la lista ya se ve reordenada; si falla, se revierte
    this.subs.add(this.menuSubjectService
      .orderSubject(this.career.id, this.year, this.subjects.map(s => s.id))
      .subscribe({
        error: (error) => {
          this.subjects = previous;
          console.log('error orderSubjects:', error?.error?.message ?? error);
          this.notify('error', 'Error order subjects');
        }
      }));
  }

  // ---------------------------------------------------------------------------
  // Formulario (crear / editar)
  // ---------------------------------------------------------------------------

  openCreate(): void {
    this.mode = 'create';
    this.resetForm();
  }

  openEdit(subject: Subject): void {
    this.mode = 'edit';
    this.form = { ...subject };
    this.range = [toSlider(subject.quarts[0]), toSlider(subject.quarts[1])];
    this.requirementIds = [...subject.requirements];
    this.groupIds = (subject.group ?? []).map(group => group.id);
    this.clearErrors();
  }

  closeEditor(): void {
    this.mode = null;
    this.clearErrors();
  }

  private resetForm(): void {
    this.form = emptySubject();
    this.range = [...FULL_RANGE];
    this.requirementIds = [];
    this.groupIds = [];
    this.clearErrors();
  }

  private clearErrors(): void {
    this.nameError = false;
    this.creditError = false;
  }

  save(): void {
    if (!this.validate()) {
      return;
    }
    const subject: Subject = {
      ...this.form,
      name: this.form.name.trim(),
      quarts: [toQuart(this.range[0]), toQuart(this.range[1])],
      requirements: [...this.requirementIds]
    };

    if (this.mode === 'create') {
      this.run(
        this.menuSubjectService.createSubject(subject, this.year, this.groupIds),
        'Success create subject',
        'Error create subject',
        () => {
          this.resetForm(); // el formulario queda abierto para crear otra
          this.refreshLists();
        }
      );
    } else if (this.mode === 'edit') {
      this.run(
        this.menuSubjectService.updateSubject(subject, this.year, this.groupIds),
        'Success edit subject',
        'Error edit subject',
        () => this.refreshLists()
      );
    }
  }

  private validate(): boolean {
    this.nameError = !this.form.name.trim();
    this.creditError = !Number.isFinite(this.form.credit) || this.form.credit < 0;
    return !this.nameError && !this.creditError;
  }

  // ---------------------------------------------------------------------------
  // Requisitos y grupos (listas de chips)
  // ---------------------------------------------------------------------------

  /** Una materia no puede ser requisito de sí misma. */
  get availableRequirements(): Subject[] {
    return this.allSubjects.filter(s => s.id !== this.form.id && !this.requirementIds.includes(s.id));
  }

  get selectedRequirements(): Subject[] {
    return this.allSubjects.filter(s => this.requirementIds.includes(s.id));
  }

  get availableGroups(): Group[] {
    return this.groups.filter(g => !this.groupIds.includes(g.id));
  }

  get selectedGroups(): Group[] {
    return this.groups.filter(g => this.groupIds.includes(g.id));
  }

  toggleRequirement(id: number): void {
    this.requirementIds = this.toggle(this.requirementIds, id);
  }

  toggleGroup(id: number): void {
    this.groupIds = this.toggle(this.groupIds, id);
  }

  private toggle(ids: number[], id: number): number[] {
    return ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];
  }

  // ---------------------------------------------------------------------------
  // Grupos: crear y borrar
  // ---------------------------------------------------------------------------

  openNewGroup(): void {
    this.showNewGroup = true;
  }

  closeNewGroup(): void {
    this.showNewGroup = false;
    this.newGroupName = '';
    this.groupNameError = false;
  }

  createGroup(): void {
    const name = this.newGroupName.trim();
    this.groupNameError = !name;
    if (this.groupNameError) {
      return;
    }
    this.run(
      this.authService.createGroup(name),
      'Success create group',
      'Error create group',
      () => {
        this.closeNewGroup();
        this.getGroups();
      }
    );
  }

  askDeleteGroup(group: Group): void {
    this.groupToDelete = group;
  }

  cancelDeleteGroup(): void {
    this.groupToDelete = null;
  }

  confirmDeleteGroup(): void {
    const group = this.groupToDelete;
    if (!group) {
      return;
    }
    this.groupToDelete = null;
    this.run(
      this.authService.deleteGroup(group.id),
      'Success delete group',
      'Error delete group',
      () => {
        this.groupIds = this.groupIds.filter(id => id !== group.id);
        this.getGroups();
      }
    );
  }

  // ---------------------------------------------------------------------------
  // Borrado de materias
  // ---------------------------------------------------------------------------

  askDelete(subject: Subject): void {
    this.subjectToDelete = subject;
  }

  cancelDelete(): void {
    this.subjectToDelete = null;
  }

  confirmDelete(): void {
    const subject = this.subjectToDelete;
    if (!subject) {
      return;
    }
    this.subjectToDelete = null;
    this.run(
      this.menuSubjectService.deleteSubject(subject.id),
      'Success delete subject',
      'Error delete subject',
      () => {
        // Si justo se estaba editando la materia borrada, se cierra el formulario
        if (this.mode === 'edit' && this.form.id === subject.id) {
          this.closeEditor();
        }
        this.requirementIds = this.requirementIds.filter(id => id !== subject.id);
        this.refreshLists();
      }
    );
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.drag) {
      this.endDrag();
    } else if (this.groupToDelete) {
      this.cancelDeleteGroup();
    } else if (this.subjectToDelete) {
      this.cancelDelete();
    } else if (this.showNewGroup) {
      this.closeNewGroup();
    } else if (this.mode) {
      this.closeEditor();
    }
  }

  // ---------------------------------------------------------------------------
  // Peticiones de escritura y avisos
  // ---------------------------------------------------------------------------

  /** Lanza una petición de escritura: spinner y aviso de éxito o error. Lo demás va en onSuccess. */
  private run(request: Observable<unknown>, okText: string, errorText: string, onSuccess?: () => void): void {
    this.showSpinner = true;
    this.subs.add(request.subscribe({
      next: () => {
        this.showSpinner = false;
        onSuccess?.();
        this.notify('success', okText);
      },
      error: (error) => {
        this.showSpinner = false;
        console.log(errorText + ':', error?.error?.message ?? error);
        this.notify('error', errorText);
      }
    }));
  }

  /** Muestra un aviso que se cierra solo (o al hacer clic). */
  private notify(severity: 'success' | 'error', summary: string): void {
    this.messages = [{ severity, summary }];
    this.showMessage = true;
    clearTimeout(this.messageTimer);
    this.messageTimer = setTimeout(() => this.showMessage = false, 3500);
  }
}
