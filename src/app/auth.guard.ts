import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.authService.userProfile().pipe(
      map((groups) => {
        // Si el usuario está autenticado, permitir el acceso
        return true;
      }),
      catchError((error) => {
        // Si ocurre un error (usuario no autenticado), redirigir a '/home'
        return of(this.router.createUrlTree(['/home']));
      })
    );
  }
}
