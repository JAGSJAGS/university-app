import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment.prod';
import { Storage } from '@ionic/storage-angular';
import { Career, Year } from '../../interfaces/Career';

@Injectable({
  providedIn: 'root'
})
export class MenuYearService {

  private apiUrl: string = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) { }

  getAllYears():Observable<any>{
    let url = `${this.apiUrl}/get_all_years`
    return from(this.getToken()).pipe(
      switchMap(token => {
        let headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        let options = {
          headers
        };
        return this.http.get<any>(url, options);
      })
    );
  }

  createYear( year: Year, career: Career):Observable<any>{
    let url = `${ this.apiUrl }/create_year`;

    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        return this.http.post<any>(url, 
        { 
          "year": year.year,
          "career_id": career.id
        },
        {
          headers
        });
      })
    );
  }

  updateYear( year: Year):Observable<any>{
    let url = `${ this.apiUrl }/update_year`;

    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        return this.http.post<any>(url, 
        { 
          "id": year.id,
          "year": year.year
        },
        {
          headers
        });
      })
    );
  }

  getYears(career: Career): Observable<any> {
    const url = `${this.apiUrl}/get_years`;
  
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        const options = {
          headers,
          params: {
            'career_id': career.id.toString()
          }
        };
        return this.http.get<any>(url, options);
      })
    );
  }

  cloneYear( career_id: number, year_id: number):Observable<any>{
    let url = `${ this.apiUrl }/clone_year`;

    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        return this.http.post<any>(url, 
        { 
          "career_id": career_id,
          "year_id": year_id
        },
        {
          headers
        });
      })
    );
  }

  deleteYear(year: Year){
    const url = `${this.apiUrl}/delete_year`;
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({'Authorization': `Bearer ${token}`});
        const options = {
          headers: headers,
          params: { 'id': year.id }
        };
        return this.http.delete<any>(url, options);
      })
    );
  }

  getCareer(careerId: number):Observable<any>{
    let url = `${ this.apiUrl }/get_career`;
    return this.http.get<any>(url, { params: { 'id': careerId.toString() } });
  }

  private getToken(): Promise<string | null> {
    return this.storage.get('access_token');
  }
}
