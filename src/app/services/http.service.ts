import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '../models/user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private httpService = inject(HttpClient);
  private server = 'http://localhost:3000/api';

  login(username: string, password: string): Observable<User | { valid: false }> {
    return this.httpService.post<User | { valid: false }>(
      `${this.server}/auth`,
      {
        username,
        password,
      }
    );
  }

  register(username: string, name: string, email: string, password: string, role: string): Observable<User | { valid: false }> {
    return this.httpService.post<User | { valid: false }>(
      `${this.server}/auth/register`,
      {
        username,
        name,
        email,
        password,
        role,
      }
    );
  }
}
