import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { HomeService } from '../../home.service';
import { Subscription } from 'rxjs';
import { Career, Careers } from '../../../../interfaces/Career';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../../auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  subs: Subscription = new Subscription();

  careers: Careers = {data:[]};
  career: Career = {
    id: 0,
    name: "",
    years: []
  }

  showSpinner: boolean = false;
  constructor(
    private router: Router,
    private storage: Storage,
    private homeService: HomeService,
    private translate: TranslateService,
    private authService: AuthService
  )
  {}

  ngOnInit(): void {
    this.isAuth();
    this.ifAuthenticated(); 
    this.getNamesCareer();
  }

  async ifAuthenticated() {
    const isAuthenticated = await this.storage.get('authenticated'); 
    if (isAuthenticated) {
      this.router.navigate(['/menu']);
    }
  }

  goToPanel(){
    this.router.navigate(['/panel', this.career.id]);
  }

  getNamesCareer(){
    this.showSpinner = true;
    this.subs.add(this.homeService.getCareers().subscribe({
      next: (namesCareer) => {
        this.showSpinner = false;
        this.careers = namesCareer;
      },
      error: (error) => {
        this.showSpinner = false;
        console.log("error getCategories: " + error);
      }
    }));
  }

  changeLanguage(language: string){
    this.translate.use(language);
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
