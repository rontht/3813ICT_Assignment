import { Component, Input } from '@angular/core';
import { Channel } from '../../../models/channel';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat {
  @Input() current_channel: Channel | null = null;
}
