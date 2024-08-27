import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  private apiUrl: string = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) { }

  getNamesCareer():Observable<string[]>{
    let url = `${ this.apiUrl }/get_json_files`;
    return this.http.get<string[]>( url );
  }

  private getToken(): Promise<string | null> {
    return this.storage.get('access_token');
  }
}
