import { Location } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { Message } from 'primeng/api';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../../../auth.service';
import { Career, Year, Years } from '../../../../interfaces/Career';
import { MenuYearService } from '../../menu-year.service';

type EditorMode = 'create' | 'edit';

/** Años de una misma carrera, para elegir cuál clonar. */
interface CloneGroup {
  name: string;
  years: Year[];
}

const emptyYear = (): Year => ({ id: 0, year: 0, subjects: [], career_id: 0, career_name: '' });
const emptyCareer = (): Career => ({ id: 0, name: '', years: [] });

@Component({
  selector: 'app-menu-year',
  templateUrl: './menu-year.component.html',
  styleUrl: './menu-year.component.scss'
})
export class MenuYearComponent implements OnInit, OnDestroy {
  subs: Subscription = new Subscription();

  career: Career = emptyCareer();
  years: Years = { data: [] };
  showSpinner = false;

  /** Formulario lateral: null = cerrado. Un solo formulario para crear y editar. */
  mode: EditorMode | null = null;
  form: Year = emptyYear();
  yearError = false;

  /** Año pendiente de confirmar el borrado (null = diálogo cerrado). */
  yearToDelete: Year | null = null;

  /** Diálogo de clonar: años de todas las carreras agrupados por carrera. */
  showClone = false;
  cloneGroups: CloneGroup[] = [];

  messages: Message[] = [];
  showMessage = false;
  private messageTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private authService: AuthService,
    private storage: Storage,
    private router: Router,
    private menuYearService: MenuYearService,
    private activatedRoute: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.subs.add(this.activatedRoute.params.subscribe(({ id }) => {
      this.career = { ...emptyCareer(), id: Number(id) };
      this.closeEditor();
      this.getYears();
      this.getCareer();
    }));
  }

  ngOnDestroy(): void {
    clearTimeout(this.messageTimer);
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

  selectSubjects(year: Year): void {
    this.router.navigate(['/menu-subject', year.id]);
  }

  // ---------------------------------------------------------------------------
  // Formulario (crear / editar)
  // ---------------------------------------------------------------------------

  openCreate(): void {
    this.mode = 'create';
    this.form = emptyYear();
    this.yearError = false;
  }

  openEdit(year: Year): void {
    this.mode = 'edit';
    this.form = { ...year };
    this.yearError = false;
  }

  closeEditor(): void {
    this.mode = null;
    this.yearError = false;
  }

  save(): void {
    if (!this.validate()) {
      return;
    }
    const year: Year = { ...this.form, year: Number(this.form.year) };

    if (this.mode === 'create') {
      this.run(
        this.menuYearService.createYear(year, this.career),
        'Success create year',
        'Error create year',
        () => this.form = emptyYear() // el formulario queda abierto para crear otro
      );
    } else if (this.mode === 'edit') {
      this.run(
        this.menuYearService.updateYear(year),
        'Success edit year',
        'Error update year'
      );
    }
  }

  /** El año tiene que ser un entero positivo. */
  private validate(): boolean {
    const value = Number(this.form.year);
    this.yearError = !Number.isInteger(value) || value < 1;
    return !this.yearError;
  }

  // ---------------------------------------------------------------------------
  // Borrado
  // ---------------------------------------------------------------------------

  askDelete(year: Year): void {
    this.yearToDelete = year;
  }

  cancelDelete(): void {
    this.yearToDelete = null;
  }

  confirmDelete(): void {
    const year = this.yearToDelete;
    if (!year) {
      return;
    }
    this.yearToDelete = null;
    this.run(
      this.menuYearService.deleteYear(year),
      'Success delete year',
      'Error delete year',
      () => {
        // Si justo se estaba editando el año borrado, se cierra el formulario
        if (this.mode === 'edit' && this.form.id === year.id) {
          this.closeEditor();
        }
      }
    );
  }

  // ---------------------------------------------------------------------------
  // Clonar
  // ---------------------------------------------------------------------------

  openClone(): void {
    this.showClone = true;
    this.getAllYears();
  }

  closeClone(): void {
    this.showClone = false;
  }

  cloneYear(year: Year): void {
    this.run(
      this.menuYearService.cloneYear(this.career.id, year.id),
      'Success clone year',
      'Error clone year',
      () => this.closeClone()
    );
  }

  private groupByCareer(years: Year[]): CloneGroup[] {
    const groups = new Map<string, Year[]>();
    for (const year of years) {
      const name = year.career_name ?? '';
      const list = groups.get(name);
      if (list) {
        list.push(year);
      } else {
        groups.set(name, [year]);
      }
    }
    return Array.from(groups, ([name, list]) => ({
      name,
      years: list.sort((a, b) => a.year - b.year)
    }));
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.yearToDelete) {
      this.cancelDelete();
    } else if (this.showClone) {
      this.closeClone();
    } else if (this.mode) {
      this.closeEditor();
    }
  }

  // ---------------------------------------------------------------------------
  // Datos
  // ---------------------------------------------------------------------------

  getCareer(): void {
    this.showSpinner = true;
    this.subs.add(this.menuYearService.getCareer(this.career.id).subscribe({
      next: (response) => {
        this.career = response.data;
        this.showSpinner = false;
      },
      error: (error) => {
        console.log('error getCareer:', error?.error?.message ?? error);
        this.showSpinner = false;
      }
    }));
  }

  getYears(): void {
    this.showSpinner = true;
    this.subs.add(this.menuYearService.getYears(this.career).subscribe({
      next: (years: Years) => {
        // Siempre de menor a mayor
        this.years = { ...years, data: [...(years.data ?? [])].sort((a, b) => a.year - b.year) };
        this.showSpinner = false;
      },
      error: (error) => {
        console.log('error getYears:', error?.error?.message ?? error);
        this.showSpinner = false;
      }
    }));
  }

  private getAllYears(): void {
    this.showSpinner = true;
    this.subs.add(this.menuYearService.getAllYears().subscribe({
      next: (response) => {
        this.cloneGroups = this.groupByCareer(response.data ?? []);
        this.showSpinner = false;
      },
      error: (error) => {
        console.log('error getAllYears:', error?.error?.message ?? error);
        this.showSpinner = false;
      }
    }));
  }

  /**
   * Lanza una petición de escritura: spinner, aviso de éxito o error y recarga de la lista.
   * (Antes create/update/clone/delete repetían este bloque cuatro veces.)
   */
  private run(request: Observable<unknown>, okText: string, errorText: string, onSuccess?: () => void): void {
    this.showSpinner = true;
    this.subs.add(request.subscribe({
      next: () => {
        this.showSpinner = false;
        onSuccess?.();
        this.getYears();
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
