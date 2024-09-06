import { Injectable } from '@angular/core';
import { environment } from '../environments/environment.prod';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { from, map, Observable, switchMap } from 'rxjs';
import { User } from './interfaces/user';
import { Storage } from '@ionic/storage-angular';
import { Career } from './interfaces/Career';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl: string = environment.apiUrl;
  private isAuthenticatedFlag: boolean = false;

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) { }

  loginUser(email: string, password: string):Observable<any>{
    let url = `${ this.apiUrl }/login_user`;
    return this.http.post<any>( url, {'email': email, 'password': password});
  }

  logOutUser(){
    const url = `${this.apiUrl}/logout_user`;
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({'Authorization': `Bearer ${token}`});
        return this.http.get<any>(url, { headers });
      })
    )
  }

  getJsonFile(nameFile: string):Observable<Career>{
    let url = `${ this.apiUrl }/get_json_file`;
    return this.http.post<Career>( url, {'file_name': nameFile});
  }

  getCareer(id: number): Observable<any> {
    let url = `${this.apiUrl}/get_all_career`;
  
    return from(this.getToken()).pipe(
      switchMap(token => {
        let headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        let options = {
          headers,
          params: {
            'id': id
          }
        };
        return this.http.get<any>(url, options);
      })
    );
  }

  /* registerUser2( user: User):Observable<any>{
    let url = `${ this.apiUrl }/register_user`;
    return this.http.post<any>( url, {
      
        'email': user.data.email,
        'password': user.data.password,
        'password_confirmation': user.data.password_confirmation,
        'first_name': user.data.first_name,
        'last_name': user.data.last_name,
        'phone_number': user.data.phone_number,
        'city_name': user.data.city_name
    });
  } */

  /* registerUser(user: User):Observable<User>{
    const url = `${this.apiUrl}/register_user`;
    return from(this.getCityStorage()).pipe(
      switchMap(city_name => {
        return this.http.post<User>(url, { 
          'email': user.data.email,
          'password': user.data.password,
          'password_confirmation': user.data.password_confirmation,
          'first_name': user.data.first_name,
          'last_name': user.data.last_name,
          'phone_number': user.data.phone_number,
          'city_name': user.data.city_name
        });
      })
    )
  } */

  getUserProfile(): Observable<any> {
    const url = `${this.apiUrl}/user_profile`;
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        return this.http.get<any>(url, { headers });
      })
    );
  }

  /* logOutUser(){
    const url = `${this.apiUrl}/logout_user`;
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({'Authorization': `Bearer ${token}`});
        return this.http.get<any>(url, { headers });
      })
    )
  } */

 /*  deleteUser(){
    const url = `${this.apiUrl}/delete_user`;
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({'Authorization': `Bearer ${token}`});
        return this.http.get<any>(url, { headers });
      })
    )
  } */

  /* updateUser(user:any) :Observable<User> {
    const url = `${this.apiUrl}/update_profile`;
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({'Authorization': `Bearer ${token}`});
        return this.http.patch<User>(url, user, { headers });
      })
    )
  } */

 /*  updateCityUser(city_name: string) :Observable<User> {
    const url = `${this.apiUrl}/update_city_user`;
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({'Authorization': `Bearer ${token}`});
        return this.http.patch<User>(url, {'city_name': city_name}, { headers });
      })
    )
  } */

  private getToken(): Promise<string | null> {
    return this.storage.get('access_token');
  }

  private getCityStorage(): Promise<string | null> {
    return this.storage.get('country');
  }
}
