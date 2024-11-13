import { Component } from '@angular/core';
import { AuthService } from '../../../../auth.service';
import { Subscription } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  subs: Subscription = new Subscription();

  email: string = "";
  password: string = "";
  messageError: string = "";
  severetyMessage: string = "";

  showSpinner: boolean = true;
  showMessageError: boolean = false;
  showLogin: boolean = true;

  constructor(
    private authService: AuthService,
    private storage: Storage,
    private router: Router
  ){}

  ngOnInit(): void {
    this.isAuth();
  }

  login(){
    if(this.validate()){
      this.showSpinner = true;
      this.showMessageError = false;
      this.subs.add(this.authService.loginUser(this.email, this.password).subscribe({
        next: (valor) => {
          this.storage.set('access_token', valor.access_token);
          this.storage.set('authenticated', true);
          //console.log('autenticado', valor);
          this.router.navigate(['/menu-career']);
          this.showSpinner = false;
        },
        error: (error) => {
          this.showSpinner = false;
          console.log("Error en el inicio de sesión:", error);
          if (error && error.error && error.error.message) {
            this.messageError = error.error.message; 
            console.log("Mensaje de error del servidor:", error.error.message);
          } else {
            console.log("Error desconocido");
          }
          this.showMessageError = true;
          this.severetyMessage = 'error'
        }
      }));
    } 
  }

  showErrorEmail = false;
  emailError = "";
  showErrorPassword = false;
  passwordError = ""
  validate(): boolean{
    let res: boolean = true;
    this.showErrorEmail = false;
    this.showErrorPassword = false;
    let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(this.email)){
      this.showErrorEmail = true;
      this.emailError = "The email does not have a valid format.";
      res = false;
    }
    if (this.email.length < 1){
      this.showErrorEmail = true;
      this.emailError = "The field is required.";
      res = false;
    }
    if (this.password.length < 1){
      this.showErrorPassword = true;
      this.passwordError = "The field is required.";
      res = false;
    }
    return res;
  }

  isAuth(){
    this.subs.add(this.authService.userProfile().subscribe({
      next: (groups) => {
        this.router.navigate(['/menu-career']);
      },
      error: (error) => {
      }
    }));
  }
}