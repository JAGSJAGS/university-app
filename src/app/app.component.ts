import { Component } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Subscription } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'universidad-app';
  subs: Subscription = new Subscription();
  
  constructor(
    private storage: Storage,
    private authService: AuthService,
    private router: Router
  ){
    this.ngOnInit();
    this.isAuth();
  }

  async ngOnInit() {
    await this.storage.create();
  }

  isAuth(){
    this.subs.add(this.authService.userProfile().subscribe({
      next: (groups) => {
        this.router.navigate(['/menu']);
      },
      error: (error) => {
      }
    }));
  }
}
