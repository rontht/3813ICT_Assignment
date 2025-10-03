import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '../models/user';
import { Groups } from '../models/groups';
import { Group } from '../models/group';
import { Channel } from '../models/channel';
import { Log } from '../models/log';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class DataService {
  private httpService = inject(HttpClient);
  private readonly server = environment.apiserver;

  private attachHeader() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return new HttpHeaders({ 'username': user?.username || '' });
  }

  getGroups() {
    return this.httpService.get<Group[]>(`${this.server}/groups`, {
      headers: this.attachHeader(),
    });
  }

  getGroup(group_id: string) {
    return this.httpService.get<Group>(
      `${this.server}/group/${group_id}`,
      {
        headers: this.attachHeader(),
      }
    );
  }

  getChannels(group_id: any) {
    return this.httpService.get<Channel[]>(
      `${this.server}/groups/${group_id}/channels`,
      {
        headers: this.attachHeader(),
      }
    );
  }

  getMembers(group_id: any) {
    return this.httpService.get<User[]>(
      `${this.server}/groups/${group_id}/members`,
      {
        headers: this.attachHeader(),
      }
    );
  }

  getRequests(group_id: any) {
    return this.httpService.get<User[]>(
      `${this.server}/groups/${group_id}/requests`,
      {
        headers: this.attachHeader(),
      }
    );
  }

  getBanned(channel_id: any) {
    return this.httpService.get<User[]>(
      `${this.server}/channels/${channel_id}/banned`,
      {
        headers: this.attachHeader(),
      }
    );
  }

  getChannelMembers(channel_id: any) {
    return this.httpService.get<User[]>(
      `${this.server}/channels/${channel_id}/members`,
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

  getAllGroupsForSearch() {
    return this.httpService.get<Groups[]>(`${this.server}/search/groups`, {
      headers: this.attachHeader(),
    });
  }

  createGroup(group: Group) {
    return this.httpService.post<Group>(
      `${this.server}/group/`,
      group,
      { headers: this.attachHeader() }
    );
  }

  editGroup(id: string, group: Group) {
    return this.httpService.put<Group>(
      `${this.server}/group/${id}`,
      group,
      { headers: this.attachHeader() }
    );
  }

  createChannel(name: string, group_id: string) {
    return this.httpService.post<Channel>(
      `${this.server}/channel/${group_id}`,
      { name },
      { headers: this.attachHeader() }
    );
  }

  deleteChannel(id: string) {
    return this.httpService.delete<Channel>(
      `${this.server}/channel/${id}`,
      { headers: this.attachHeader() }
    );
  }

  addChannelMember(username: string, channel_id: string) {
    return this.httpService.put<any>(
      `${this.server}/channel/${channel_id}/members/${username}`,
      {},
      { headers: this.attachHeader() }
    );
  }

  banMember(username: string, channel_id: string) {
    return this.httpService.put<any>(
      `${this.server}/channel/${channel_id}/bans/${username}`,
      {},
      { headers: this.attachHeader() }
    );
  }

  removeChannelMember(username: string, channel_id: string) {
    return this.httpService.delete<any>(
      `${this.server}/channel/${channel_id}/members/${username}`,
      { headers: this.attachHeader() }
    );
  }

  deleteGroup(id: string) {
    return this.httpService.delete<any>(
      `${this.server}/group/${id}`,
      { headers: this.attachHeader() }
    );
  }

  deleteUser(username: string) {
    return this.httpService.delete<any>(
      `${this.server}/user/${username}`,
      { headers: this.attachHeader() }
    );
  }

  promoteUser(username: string) {
    return this.httpService.patch<User>(
      `${this.server}/user/${username}/role`,
      {},
      { headers: this.attachHeader() }
    );
  }

  leaveGroup(id: string) {
    return this.httpService.delete<any>(
      `${this.server}/group/${id}/member`,
      { headers: this.attachHeader() }
    );
  }

  sendRequest(id: string) {
    return this.httpService.patch<string>(
      `${this.server}/group/${id}/request`,
      {},
      { headers: this.attachHeader() }
    );
  }

  getLogs() {
    return this.httpService.get<Log[]>(
      `${this.server}/log`,
      { headers: this.attachHeader() }
    );
  }

  uploadChatImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return this.httpService.post<{ success: boolean; url: string }>(
      `${this.server}/upload/chat`,
      formData
    );
  }
}
