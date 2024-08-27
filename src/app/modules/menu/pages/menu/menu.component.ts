import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../auth.service';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {

  subs: Subscription = new Subscription();

  email: string = "";
  password: string = "";
  messageError: string = "";
  severetyMessage: string = "";

  showSpinner: boolean = true;
  showMessageError: boolean = false;
  showCareer: boolean = false;

  constructor(
    private authService: AuthService,
    private storage: Storage,
    private router: Router
  ){}

  logoutUser(){
    this.showSpinner = true;
    this.subs.add(this.authService.logOutUser().subscribe({
      next: (valor) => {
        this.showSpinner = false;
        console.log('valor', valor);
        this.storage.set('authenticated', false);
        //this.authService.setAuthenticatedFlag(false);
        this.router.navigate(['/home']);

      },
      error: (error) => {
        this.showSpinner = false;
        this.storage.set('authenticated', false);
        console.log("error logOutUser: " + error);
      }
    }));
  }
}
