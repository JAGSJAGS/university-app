import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Career, Careers } from '../../interfaces/Career';
import { from, Observable, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment.prod';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class MenuCareerService {

  private apiUrl: string = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) { }

  getCareers():Observable<Careers>{
    let url = `${ this.apiUrl }/get_careers`;
    return this.http.get<Careers>( url );
  }

  createCareer( career: Career):Observable<any>{
    let url = `${ this.apiUrl }/create_career`;

    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        return this.http.post<any>(url, 
        { 
          "name": career.name
        },
        {
          headers
        });
      })
    );
  }

  updateCareer( career: Career):Observable<any>{
    let url = `${ this.apiUrl }/update_career`;

    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        return this.http.post<any>(url, 
        { 
          "id": career.id,
          "name": career.name
        },
        {
          headers
        });
      })
    );
  }

  deleteCareer(career: Career){
    const url = `${this.apiUrl}/delete_career`;
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({'Authorization': `Bearer ${token}`});
        const options = {
          headers: headers,
          params: { 'id': career.id }
        };
        return this.http.delete<any>(url, options);
      })
    );
  }

  private getToken(): Promise<string | null> {
    return this.storage.get('access_token');
  }
}
