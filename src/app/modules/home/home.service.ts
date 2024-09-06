import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { Observable } from 'rxjs';
import { Careers } from '../../interfaces/Career';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  private apiUrl: string = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) { }

  getCareers():Observable<Careers>{
    let url = `${ this.apiUrl }/get_careers`;
    return this.http.get<Careers>( url );
  }

  private getToken(): Promise<string | null> {
    return this.storage.get('access_token');
  }
}
