import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';
import { from, Observable, switchMap } from 'rxjs';
import { Career, Group, Subject, Subjects, Year } from '../../interfaces/Career';

@Injectable({
  providedIn: 'root'
})
export class MenuSubjectService {

  private apiUrl: string = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) { }

  orderSubject( careerId: number, year: Year, arrayId: number[]):Observable<any>{
    let url = `${ this.apiUrl }/order_subjects`;
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        return this.http.post<any>(url, 
        { 
          "order": arrayId,
          "year_id": year.id,
          "career_id": careerId
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

  updateSubject( subject: Subject, year: Year, groups: number []):Observable<any>{
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
          "link": subject.link,
          "quarts": subject.quarts,
          "requirements": subject.requirements,
          "groups": groups
        },
        {
          headers
        });
      })
    );
  }

  createSubject( subject: Subject, year: Year, groups: number []):Observable<any>{
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
          "link": subject.link,
          "quarts": subject.quarts,
          "requirements": subject.requirements,
          "groups": groups
        },
        {
          headers
        });
      })
    );
  }

  getYear(yearId: number):Observable<any>{
    let url = `${ this.apiUrl }/get_year`;
    return this.http.get<any>(url, { params: { 'id': yearId.toString() } });
  }

  private getToken(): Promise<string | null> {
    return this.storage.get('access_token');
  }
}
