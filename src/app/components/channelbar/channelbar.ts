import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface Channel {
  id: string;
  name: string;
}

@Component({
  selector: 'app-channelbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './channelbar.html',
  styleUrl: './channelbar.css',
})
export class Channelbar {
  @Input() channels: Channel[] = [];
  @Input() current_channel_id: string | null = null;

  @Output() openChannel = new EventEmitter<Channel>();

  openChannelHandler(c: Channel) {
    if (!c) return;
    this.openChannel.emit(c);
  }

  track_by_channel_id = (_: number, c: Channel) => c.id;
}
