import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { from, Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../environments/environment.prod';

/**
 * - Añade `Authorization: Bearer <token>` a las peticiones hacia nuestra API
 *   (nunca a assets, traducciones ni dominios de terceros).
 * - Si la API responde 401 a una petición que llevaba token, la sesión caducó
 *   (por ejemplo, por inactividad): se limpia el token y se manda al login.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private apiUrl: string = environment.apiUrl;

  constructor(
    private storage: Storage,
    private router: Router
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isApiRequest(req) || this.isAuthEndpoint(req)) {
      return next.handle(req);
    }

    return from(this.getToken()).pipe(
      switchMap(token => {
        const authReq = token
          ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
          : req;

        return next.handle(authReq).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && token) {
              this.onSessionExpired();
            }
            return throwError(() => error);
          })
        );
      })
    );
  }

  private isApiRequest(req: HttpRequest<any>): boolean {
    return req.url.startsWith(this.apiUrl);
  }

  // Login y registro no llevan token y un 401 ahí significa "credenciales inválidas"
  private isAuthEndpoint(req: HttpRequest<any>): boolean {
    return req.url === `${this.apiUrl}/login_user` || req.url === `${this.apiUrl}/register_user`;
  }

  private async getToken(): Promise<string | null> {
    try {
      return await this.storage.get('access_token');
    } catch {
      // El storage aún no está inicializado: se trata como "sin sesión"
      return null;
    }
  }

  private onSessionExpired(): void {
    this.storage.set('access_token', '');
    this.storage.set('authenticated', false);
    this.router.navigate(['/login']);
  }
}
