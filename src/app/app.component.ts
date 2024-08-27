import { Component } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'universidad-app';
  constructor(
    private storage: Storage
  ){
    this.ngOnInit();
  }

  async ngOnInit() {
    await this.storage.create();
  }
}
