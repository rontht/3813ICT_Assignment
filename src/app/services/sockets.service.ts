import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Message } from '../models/message';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketsService {
  private socket: Socket;
  messages = signal<Message[]>([]);
  private readonly server = environment.socket;

  constructor() {
    this.socket = io(this.server, {
      transports: ['websocket'],
      reconnectionAttempts: 5
    });
    this.socket.on('connect_error', (err) => console.warn('socket connect_error', err));
    this.socket.on('disconnect', (reason) => console.log('socket disconnected', reason));
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
    return new Observable<Message>((observer) => {
      const handler = (msg: Message) => {
        this.messages.update(list => [...list, msg]);
        observer.next(msg);
      };
      this.socket.on('new_message', handler);
      return () => {
        this.socket.off('new_message', handler);
      };
    });
  }

  disconnect() {
    if (this.socket?.connected) this.socket.disconnect();
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
