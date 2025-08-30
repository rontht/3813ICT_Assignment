import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Channel } from '../../../models/channel';
import { Group } from '../../../models/group';

@Component({
  selector: 'app-channelbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './channelbar.html',
  styleUrl: './channelbar.css',
})
export class Channelbar {
  @Input() channels: Channel[] = [];
  @Input() current_channel: Channel | null = null;
  @Input() current_group: Group | null = null;
  @Input() canManageGroup!: boolean;

  @Output() openChannel = new EventEmitter<Channel>();
  @Output() toggleGroupSettings = new EventEmitter<void>();

  track_by_channel_id = (_: number, channel: Channel) => channel.id;
}
