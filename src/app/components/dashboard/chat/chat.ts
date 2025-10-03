import { Component, inject, Input, signal, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Channel } from '../../../models/channel';
import { User } from '../../../models/user';
import { Message } from '../../../models/message';
import { SocketsService } from '../../../services/sockets.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat implements OnInit, OnChanges {
  private socketService = inject(SocketsService);

  @Input() current_channel: Channel | null = null;
  @Input() current_user: User | null = null;
  @Input() old_messages: Message[] = [];

  messageout = signal('');
  messagesin = signal<Message[]>([]);

  public clearMessages() {
    this.messagesin.set([]);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['old_messages']) {
      this.messagesin.set(this.old_messages || []);
    }
    if (changes['current_channel']) {
      // scroll to bottom
    }
  }

  ngOnInit() {
    this.socketService.onMessage().subscribe((msg: Message) => {
      if (!this.current_channel || msg.channel_id === this.current_channel.id) {
        this.messagesin.update(list => [...list, msg]);
      }
    });
  }

  send() {
    if (!this.current_channel?.id || !this.current_user?.username) return;

    const body = this.messageout().trim();
    if (!body) return;

    const msg = new Message(this.current_channel.id, this.current_user.username, body);
    this.socketService.sendMessage(msg);
    this.messageout.set('');
  }
}
