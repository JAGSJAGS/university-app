import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.prod';
import { Career, Year } from '../../interfaces/Career';

@Injectable({
  providedIn: 'root'
})
export class MenuYearService {

  private apiUrl: string = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) { }

  getAllYears():Observable<any>{
    let url = `${this.apiUrl}/get_all_years`
    return this.http.get<any>(url);
  }

  createYear( year: Year, career: Career):Observable<any>{
    let url = `${ this.apiUrl }/create_year`;
    return this.http.post<any>(url, { "year": year.year, "career_id": career.id });
  }

  updateYear( year: Year):Observable<any>{
    let url = `${ this.apiUrl }/update_year`;
    return this.http.post<any>(url, { "id": year.id, "year": year.year });
  }

  getYears(career: Career): Observable<any> {
    const url = `${this.apiUrl}/get_years`;
    return this.http.get<any>(url, { params: { 'career_id': career.id.toString() } });
  }

  cloneYear( career_id: number, year_id: number):Observable<any>{
    let url = `${ this.apiUrl }/clone_year`;
    return this.http.post<any>(url, { "career_id": career_id, "year_id": year_id });
  }

  deleteYear(year: Year){
    const url = `${this.apiUrl}/delete_year`;
    return this.http.delete<any>(url, { params: { 'id': year.id } });
  }

  getCareer(careerId: number):Observable<any>{
    let url = `${ this.apiUrl }/get_career`;
    return this.http.get<any>(url, { params: { 'id': careerId.toString() } });
  }

  // (el token lo añade AuthInterceptor)
}
