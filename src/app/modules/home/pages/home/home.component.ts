import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { HomeService } from '../../home.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  subs: Subscription = new Subscription();

  namesCareer: string[] = [""];

  nameCareer: string = ""

  showSpinner: boolean = false;
  constructor(
    private router: Router,
    private storage: Storage,
    private homeService: HomeService
  )
  {}

  ngOnInit(): void {
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
    console.log("name:" , this.nameCareer);
    this.router.navigate(['/panel', this.nameCareer]);
  }

  getNamesCareer(){
    this.showSpinner = true;
    this.subs.add(this.homeService.getNamesCareer().subscribe({
      next: (namesCareer) => {
        this.showSpinner = false;
        this.namesCareer = namesCareer;
      },
      error: (error) => {
        this.showSpinner = false;
        console.log("error getCategories: " + error);
      }
    }));
  }
}
