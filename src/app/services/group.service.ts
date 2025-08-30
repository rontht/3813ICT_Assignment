import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private httpService = inject(HttpClient);
  private server = 'http://localhost:3000/api';

  private attachHeader() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return new HttpHeaders({ 'user-id': user?.id || '' });
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

  getAllMembers() {
    return this.httpService.get<any[]>('/users', {
      headers: this.attachHeader(),
    });
  }
}
