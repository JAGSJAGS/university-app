import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { environment } from '../../../environments/environment.prod';
import { from, Observable, switchMap } from 'rxjs';
import { Career, Careers, Subject, Subjects, Year } from '../../interfaces/Career';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private apiUrl: string = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) { }

  getCareers():Observable<Careers>{
    let url = `${ this.apiUrl }/get_careers`;
    return this.http.get<Careers>( url );
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







  getNamesCareer():Observable<any[]>{
    let url = `${ this.apiUrl }/get_json_files`;
    return this.http.get<any[]>( url );
  }

  getSubjects(year: Year): Observable<any> {
    let url = `${this.apiUrl}/get_subjects`;
    return from(this.getToken()).pipe(
      switchMap(token => {
        let headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        let options = {
          headers,
          params: {
            'year_id': year.id
          }
        };
        return this.http.get<any>(url, options);
      })
    );
  }

  getAllSubjects(career: Career): Observable<Subjects> {
    let url = `${this.apiUrl}/get_all_subjects`;
    return from(this.getToken()).pipe(
      switchMap(token => {
        let headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        let options = {
          headers,
          params: {
            'career_id': career.id
          }
        };
        return this.http.get<Subjects>(url, options);
      })
    );
  }

  createSubject( subject: Subject, year: Year):Observable<any>{
    let url = `${ this.apiUrl }/create_subject`;
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        return this.http.post<any>(url, 
        { 
          "year_id": year.id,
          "name": subject.name,
          "code": subject.code,
          "credit": subject.credit,
          "quarts": subject.quarts,
          "requirements": subject.requirements
        },
        {
          headers
        });
      })
    );
  }

  updateSubject( subject: Subject, year: Year):Observable<any>{
    let url = `${ this.apiUrl }/update_subject`;
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        return this.http.post<any>(url, 
        { 
          "id": subject.id,
          "year_id": year.id,
          "name": subject.name,
          "code": subject.code,
          "credit": subject.credit,
          "quarts": subject.quarts,
          "requirements": subject.requirements
        },
        {
          headers
        });
      })
    );
  }

  deleteSubject(subject: number){
    const url = `${this.apiUrl}/delete_subject`;
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({'Authorization': `Bearer ${token}`});
        const options = {
          headers: headers,
          params: { 'id': subject }
        };
        return this.http.delete<any>(url, options);
      })
    );
  }
  /* createCareer( nameCareer: string):Observable<Career>{
    let url = `${ this.apiUrl }/create_json_file`;

    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        return this.http.post<Career>(url, 
        { 
          "name_json_file": nameCareer,
          "data": {
              "id": 0,
              "name": nameCareer,
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
  } */

  editCareer2( career: Career, nameFile: string):Observable<Career>{
    let url = `${ this.apiUrl }/update_json_file`;

    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        return this.http.post<Career>(url, 
        { 
          /* "name_json_file": nameFile,
          "data": {
              "id": career.id,
              "name": career.name,
              "years": career.years
          } */
        },
        {
          headers
        });
      })
    );
  }

  /* deleteCareer(file_name: string){
    const url = `${this.apiUrl}/delete_json_file`;
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({'Authorization': `Bearer ${token}`});
        const options = {
          headers: headers,
          params: { 'file_name': file_name }
        };
        return this.http.delete<any>(url, options);
      })
    );
  } */

  private getToken(): Promise<string | null> {
    return this.storage.get('access_token');
  }
}