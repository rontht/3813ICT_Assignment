import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private httpService = inject(HttpClient);
  private server = 'http://localhost:3000/api';

  private attachHeader() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return new HttpHeaders({ 'username': user?.username || '' });
  }

  getGroups() {
    return this.httpService.get<any[]>(`${this.server}/groups`, {
      headers: this.attachHeader(),
    });
  }

  getChannels(group_id: any) {
    return this.httpService.get<any[]>(
      `${this.server}/groups/${group_id}/channels`,
      {
        headers: this.attachHeader(),
      }
    );
  }

  getMembers(group_id: any) {
    return this.httpService.get<any[]>(
      `${this.server}/groups/${group_id}/members`,
      {
        headers: this.attachHeader(),
      }
    );
  }

  getAllUsers() {
    return this.httpService.get<User[]>(`${this.server}/users`, {
      headers: this.attachHeader(),
    });
  }
}
