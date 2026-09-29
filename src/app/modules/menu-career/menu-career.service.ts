import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Career, Careers } from '../../interfaces/Career';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class MenuCareerService {

  private apiUrl: string = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) { }

  getCareers():Observable<Careers>{
    let url = `${ this.apiUrl }/get_careers`;
    return this.http.get<Careers>( url );
  }

  createCareer( career: Career):Observable<any>{
    let url = `${ this.apiUrl }/create_career`;
    return this.http.post<any>(url, { "name": career.name });
  }

  updateCareer( career: Career):Observable<any>{
    let url = `${ this.apiUrl }/update_career`;
    return this.http.post<any>(url, { "id": career.id, "name": career.name });
  }

  deleteCareer(career: Career){
    const url = `${this.apiUrl}/delete_career`;
    return this.http.delete<any>(url, { params: { 'id': career.id } });
  }

  // (el token lo añade AuthInterceptor)
}
