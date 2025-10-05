import { Component, inject, Input, signal, OnInit, SimpleChanges, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Channel } from '../../../models/channel';
import { User } from '../../../models/user';
import { Message } from '../../../models/message';
import { SocketsService } from '../../../services/sockets.service';
import { DataService } from '../../../services/data.service';
import { Notification } from '../../notification/notification';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule, Notification],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat implements OnInit, OnChanges {
  private socketService = inject(SocketsService);
  private dataService = inject(DataService);

  @ViewChild('messages') private messages_container!: ElementRef;
  @ViewChild('noti') noti!: Notification;

  @Input() current_channel: Channel | null = null;
  @Input() current_user: User | null = null;
  @Input() old_messages: Message[] = [];

  messageout = signal('');
  messagesin = signal<Message[]>([]);
  selected_file: File | null = null;
  preview_url: string | null = null;
  prebuiltGifs: string[] = [];

  showGifMenu: boolean = false;

  private scrollToBottom() {
    setTimeout(() => {
      const el = this.messages_container.nativeElement;
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }, 0);
  }

  public clearMessages() {
    this.messagesin.set([]);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['old_messages']) {
      const messages: Message[] = this.old_messages || [];
      messages.forEach(message => {
        this.getChatUserData(message);
      });
      this.messagesin.set(messages);
    }
    if (changes['current_channel']) {
      setTimeout(() => {
        this.scrollToBottom();
      }, 500);
    }
  }

  getChatUserData(message: Message) {
    this.dataService.getChatData(message.sender).subscribe({
      next: (res) => {
        message.avatar = res.avatar;
        message.senderName = res.name;
      },
      error: (e) => {
        this.noti.showError("Error while getting chat data");
        console.error('get chat user data error', e);
      }
    })
  }

  placeholderAvatar(username: string) {
    return username ? username[0].toUpperCase() : 'A';
  }

  ngOnInit() {
    this.socketService.onMessage().subscribe((msg: Message) => {
      if (!this.current_channel || msg.channel_id === this.current_channel.id) {
        this.messagesin.update(list => [...list, msg]);
        this.scrollToBottom();
      }
    });
    this.dataService.getPrebuiltGifs().subscribe({
      next: (res) => {
        this.prebuiltGifs = res;
      },
      error: (e) => {
        console.error('Upload error', e);
      }
    })
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
    this.scrollToBottom();
    if (!this.current_channel?.id) {
      this.noti.showWarning('Please select a channel first!');
      return;
    };
    if (!this.current_user?.username) {
      this.noti.showError('No user detected!');
      return;
    };
    const body = this.messageout().trim();
    // ensure at least body or file exists
    if (!body && !this.selected_file && !this.preview_url) {
      this.noti.showWarning('Type something first!');
      return;
    }
    // if file exist, upload and retrieve the url to be save alongside body
    if (this.selected_file) {
      this.dataService.uploadChatImage(this.selected_file).subscribe({
        next: (res) => {
          if (res.success) {
            this.prepAndSend(body, [{ url: res.url, type: 'image' }]);
          } else {
            this.noti.showError('File upload failed', 3000);
            // console.error('File upload failed');
          }
        },
        error: (e) => {
          this.noti.showError('Upload server error', 3000);
          console.error('Upload error', e);
        }
      })
    }
    else if (this.preview_url) {
      this.prepAndSend(body, [{ url: this.preview_url, type: 'image' }]);
    } else {
      this.prepAndSend(body);
    }
  }

  toggleGifMenu() {
    this.showGifMenu = !this.showGifMenu;
  }
  
  selectGif(gif: string) {
    this.showGifMenu = false;
    this.selected_file = null;
    this.preview_url = gif;
  }
}
