import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.authService.isAuthenticated().pipe(
      map((authenticated: boolean) => {
        if (authenticated) {
          console.log('authenticated', authenticated);
          return true;
        } else {
          // Si el usuario no está autenticado, redirige al componente de inicio de sesión
          this.router.navigate(['/no-register']);
          return false;
        }
      })
    );
  }
}
