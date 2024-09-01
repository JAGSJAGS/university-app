import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { environment } from '../../../environments/environment.prod';
import { from, Observable, switchMap } from 'rxjs';
import { Career } from '../../interfaces/Career';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private apiUrl: string = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) { }

  getNamesCareer():Observable<string[]>{
    let url = `${ this.apiUrl }/get_json_files`;
    return this.http.get<string[]>( url );
  }

  getCareer(file_name: string):Observable<Career>{
    let url = `${ this.apiUrl }/get_json_file`;
    return this.http.post<Career>( url, {'file_name': file_name});
  }

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
              "id": 0,
              "name": career.name,
              "years": [
                {
                  "id": 1,
                  "year": 1,
                  "subjects": []
                }
              ]
          }
        },
        {
          headers
        });
      })
    );
  }

  editCareer( career: Career, nameFile: string):Observable<Career>{
    let url = `${ this.apiUrl }/update_json_file`;

    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        return this.http.post<Career>(url, 
        { 
          "name_json_file": nameFile,
          "data": {
              "id": career.id,
              "name": career.name,
              "years": career.years
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