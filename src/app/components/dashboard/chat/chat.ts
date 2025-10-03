import { Component, inject, Input, signal, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Channel } from '../../../models/channel';
import { User } from '../../../models/user';
import { Message } from '../../../models/message';
import { SocketsService } from '../../../services/sockets.service';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat implements OnInit, OnChanges {
  private socketService = inject(SocketsService);
  private dataService = inject(DataService);

  @Input() current_channel: Channel | null = null;
  @Input() current_user: User | null = null;
  @Input() old_messages: Message[] = [];

  messageout = signal('');
  messagesin = signal<Message[]>([]);
  selected_file: File | null = null;
  preview_url: string | null = null;

  public clearMessages() {
    this.messagesin.set([]);
  }

  ngOnChanges(changes: SimpleChanges) {
    // When parent passes new history, update messages signal
    if (changes['old_messages']) {
      this.messagesin.set(this.old_messages || []);
    }
    // Update current_channel handling (optional)
    if (changes['current_channel']) {
      // you might want to scroll to bottom, etc.
    }
  }

  ngOnInit() {
    this.socketService.onMessage().subscribe((msg: Message) => {
      if (!this.current_channel || msg.channel_id === this.current_channel.id) {
        this.messagesin.update(list => [...list, msg]);
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.selected_file = input.files[0];
    this.preview_url = URL.createObjectURL(this.selected_file);
  }

  removeSelectedFile() {
    this.selected_file = null;
    if (this.preview_url) {
      URL.revokeObjectURL(this.preview_url);
      this.preview_url = null;
    }
  }

  prepAndSend(body: string, attachments: { url: string; type: 'image' }[] = []) {
    if (!this.current_channel?.id || !this.current_user?.username) return;
    const msg = new Message(this.current_channel.id, this.current_user.username, body, attachments);
    this.socketService.sendMessage(msg);
    // reset
    this.messageout.set('');
    this.removeSelectedFile();
  }

  send() {
    if (!this.current_channel?.id || !this.current_user?.username) return;
    console.log(this.selected_file);
    const body = this.messageout().trim();
    // ensure at least body or file exists
    if (!body && !this.selected_file) return;
    // if file exist, upload and retrieve the url to be save alongside body
    if (this.selected_file) {
      this.dataService.uploadChatImage(this.selected_file).subscribe({
        next: (res) => {
          if (res.success) {
            this.prepAndSend(body, [{ url: res.url, type: 'image' }]);
          } else {
            console.error('File upload failed');
          }
        },
        error: (e) => {
          console.error('Upload error', e);
        }
      })
    } else {
      this.prepAndSend(body);
    }
  }
}
