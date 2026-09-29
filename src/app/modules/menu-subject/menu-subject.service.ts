import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Career, Group, Subject, Subjects, Year } from '../../interfaces/Career';

@Injectable({
  providedIn: 'root'
})
export class MenuSubjectService {

  private apiUrl: string = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) { }

  orderSubject( careerId: number, year: Year, arrayId: number[]):Observable<any>{
    let url = `${ this.apiUrl }/order_subjects`;
    return this.http.post<any>(url, {
      "order": arrayId,
      "year_id": year.id,
      "career_id": careerId
    });
  }

  deleteSubject(subject: number){
    const url = `${this.apiUrl}/delete_subject`;
    return this.http.delete<any>(url, { params: { 'id': subject } });
  }

  getSubjects(year: Year): Observable<any> {
    let url = `${this.apiUrl}/get_subjects`;
    return this.http.get<any>(url, { params: { 'year_id': year.id } });
  }

  getAllSubjects(career: Career): Observable<Subjects> {
    let url = `${this.apiUrl}/get_all_subjects`;
    return this.http.get<Subjects>(url, { params: { 'career_id': career.id } });
  }

  updateSubject( subject: Subject, year: Year, groups: number []):Observable<any>{
    let url = `${ this.apiUrl }/update_subject`;
    return this.http.post<any>(url, {
      "id": subject.id,
      "year_id": year.id,
      "name": subject.name,
      "code": subject.code,
      "credit": subject.credit,
      "link": subject.link,
      "quarts": subject.quarts,
      "requirements": subject.requirements,
      "groups": groups
    });
  }

  createSubject( subject: Subject, year: Year, groups: number []):Observable<any>{
    let url = `${ this.apiUrl }/create_subject`;
    return this.http.post<any>(url, {
      "year_id": year.id,
      "name": subject.name,
      "code": subject.code,
      "credit": subject.credit,
      "link": subject.link,
      "quarts": subject.quarts,
      "requirements": subject.requirements,
      "groups": groups
    });
  }

  getYear(yearId: number):Observable<any>{
    let url = `${ this.apiUrl }/get_year`;
    return this.http.get<any>(url, { params: { 'id': yearId.toString() } });
  }

  // (el token lo añade AuthInterceptor)
}
