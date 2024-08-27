import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { Storage } from '@ionic/storage-angular';
import { Career } from '../../interfaces/Career';
import { from, Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComponentsService {

  private apiUrl: string = environment.apiUrl;
  private isAuthenticatedFlag: boolean = false;

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) { }

  createCareer( career: Career):Observable<Career>{
    let url = `${ this.apiUrl }/create_json_file`;

    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        return this.http.post<Career>(url, 
        { 
          "name_json_file": career.name,
          "data": {
            "Career":{
              "id": career.id,
              "name": career.name,
              "years": career.years
            }
          }
        }, 
        {
          headers
        });
      })
    );
  }

  private getToken(): Promise<string | null> {
    return this.storage.get('access_token');
  }
}
