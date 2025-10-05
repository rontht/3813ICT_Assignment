import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Message } from '../models/message';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketsService {
  private socket: Socket;
  messages = signal<Message[]>([]);
  private messageSubject = new Subject<Message>();
  private systemSubject = new Subject<{ channel_id: string, message: string }>();
  private readonly server = environment.socket;

  constructor() {
    this.socket = io(this.server);
    this.socket.on('connect_error', (err) => console.warn('socket connect_error', err));
    this.socket.on('disconnect', (reason) => console.log('socket disconnected', reason));
    this.socket.on('new_message', (msg: Message) => {
      this.messages.update(list => [...list, msg]);
      this.messageSubject.next(msg);
    });
    this.socket.on('user_joined', (data: { username: string; channel_id: string }) => {
      this.systemSubject.next({
        channel_id: data.channel_id,
        message: `${data.username} joined the channel`
      });
    });
  }

  joinChannel(channel_id: string, username?: string) {
    this.messages.set([]);
    this.socket.emit('join', { channel_id, username });
    this.socket.once('channel_history', (history: Message[]) => {
      this.messages.set(history || []);
    });
  }

  leaveChannel(channel_id: string, username?: string) {
    this.socket.emit('leave', { channel_id, username });
    this.messages.set([]);
  }

  sendMessage(message: Message) {
    this.socket.emit('new_message', message);
  }

  onMessage(): Observable<Message> {
    return this.messageSubject.asObservable();
  }

  onSystemMessage(): Observable<{ channel_id: string, message: string }> {
    return this.systemSubject.asObservable();
  }

  disconnect() {
    if (this.socket?.connected) this.socket.disconnect();
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
