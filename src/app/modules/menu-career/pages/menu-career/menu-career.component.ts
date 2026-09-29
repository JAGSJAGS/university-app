import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { Message } from 'primeng/api';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../../../auth.service';
import { Career, Careers } from '../../../../interfaces/Career';
import { MenuCareerService } from '../../menu-career.service';

type EditorMode = 'create' | 'edit';

const emptyCareer = (): Career => ({ id: 0, name: '', years: [] });

@Component({
  selector: 'app-menu-career',
  templateUrl: './menu-career.component.html',
  styleUrl: './menu-career.component.scss'
})
export class MenuCareerComponent implements OnInit, OnDestroy {
  subs: Subscription = new Subscription();

  careers: Careers = { data: [] };
  showSpinner = false;

  /** Formulario lateral: null = cerrado. Un solo formulario para crear y editar. */
  mode: EditorMode | null = null;
  form: Career = emptyCareer();
  nameError = false;

  /** Carrera pendiente de confirmar el borrado (null = diálogo cerrado). */
  careerToDelete: Career | null = null;

  messages: Message[] = [];
  showMessage = false;
  private messageTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private authService: AuthService,
    private storage: Storage,
    private router: Router,
    private menuCareerService: MenuCareerService
  ) {}

  ngOnInit(): void {
    this.getCareers();
  }

  ngOnDestroy(): void {
    clearTimeout(this.messageTimer);
    this.subs.unsubscribe();
  }

  // ---------------------------------------------------------------------------
  // Sesión
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

  // ---------------------------------------------------------------------------
  // Navegación
  // ---------------------------------------------------------------------------

  selectYears(career: Career): void {
    this.router.navigate(['/menu-year', career.id]);
  }

  openPanel(career: Career): void {
    this.router.navigate(['/panel', career.id]);
  }

  // ---------------------------------------------------------------------------
  // Formulario (crear / editar)
  // ---------------------------------------------------------------------------

  openCreate(): void {
    this.mode = 'create';
    this.form = emptyCareer();
    this.nameError = false;
  }

  openEdit(career: Career): void {
    this.mode = 'edit';
    this.form = { ...career };
    this.nameError = false;
  }

  closeEditor(): void {
    this.mode = null;
    this.nameError = false;
  }

  save(): void {
    if (!this.validate()) {
      return;
    }
    const career: Career = { ...this.form, name: this.form.name.trim() };

    if (this.mode === 'create') {
      this.run(
        this.menuCareerService.createCareer(career),
        'Success create career',
        'Error create career',
        () => this.form = emptyCareer() // el formulario queda abierto para crear otra
      );
    } else if (this.mode === 'edit') {
      this.run(
        this.menuCareerService.updateCareer(career),
        'Success update career',
        'Error update career'
      );
    }
  }

  private validate(): boolean {
    this.nameError = !this.form.name.trim();
    return !this.nameError;
  }

  // ---------------------------------------------------------------------------
  // Borrado
  // ---------------------------------------------------------------------------

  askDelete(career: Career): void {
    this.careerToDelete = career;
  }

  cancelDelete(): void {
    this.careerToDelete = null;
  }

  confirmDelete(): void {
    const career = this.careerToDelete;
    if (!career) {
      return;
    }
    this.careerToDelete = null;
    this.run(
      this.menuCareerService.deleteCareer(career),
      'Success delete career',
      'Error delete career',
      () => {
        // Si justo se estaba editando la carrera borrada, se cierra el formulario
        if (this.mode === 'edit' && this.form.id === career.id) {
          this.closeEditor();
        }
      }
    );
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.careerToDelete) {
      this.cancelDelete();
    } else if (this.mode) {
      this.closeEditor();
    }
  }

  // ---------------------------------------------------------------------------
  // Datos
  // ---------------------------------------------------------------------------

  getCareers(): void {
    this.showSpinner = true;
    this.subs.add(this.menuCareerService.getCareers().subscribe({
      next: (careers) => {
        this.careers = careers;
        this.showSpinner = false;
      },
      error: (error) => {
        this.showSpinner = false;
        console.log('error getCareers:', error);
      }
    }));
  }

  /**
   * Lanza una petición de escritura: spinner, aviso de éxito o error y recarga de la lista.
   * (Antes create/update/delete repetían este bloque tres veces.)
   */
  private run(request: Observable<unknown>, okText: string, errorText: string, onSuccess?: () => void): void {
    this.showSpinner = true;
    this.subs.add(request.subscribe({
      next: () => {
        this.showSpinner = false;
        onSuccess?.();
        this.getCareers();
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
