import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Channel } from '../../../models/channel';
import { Group } from '../../../models/group';
import { User } from '../../../models/user';

@Component({
  selector: 'app-channelbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './channelbar.html',
  styleUrl: './channelbar.css',
})
export class Channelbar {
  @Input() user: User | null = null;
  @Input() channels: Channel[] = [];
  @Input() current_channel: Channel | null = null;
  @Input() current_group: Group | null = null;
  @Input() can_manage_group!: boolean;

  @Output() openChannel = new EventEmitter<Channel>();
  @Output() openGroupEdit = new EventEmitter<void>();

  // show only channels you can see
  get available_channels(): Channel[] {
    const list = this.channels || [];
    // if you can manage, you can see everything
    if (this.can_manage_group) return list;

    // check if user exist
    const username = this.user?.username || '';
    if (!username) return [];

    // check if user is in channel_users
    const available: Channel[] = [];
    for (let i = 0; i < list.length; i++) {
      const channel = list[i];
      const channel_user = (channel?.channel_users || []) as string[];
      if (channel_user.indexOf(username) !== -1) available.push(channel);
    }
    return available;
  }
}
