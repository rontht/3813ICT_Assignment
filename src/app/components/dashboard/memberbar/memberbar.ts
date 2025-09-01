import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Member } from '../../../models/member';
import { Channel } from '../../../models/channel';
import { GroupService } from '../../../services/group.service';

@Component({
  selector: 'app-memberbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './memberbar.html',
  styleUrl: './memberbar.css'
})
export class Memberbar implements OnChanges {
  private groupService = inject(GroupService);

  @Input() channel: Channel | null = null;

  current_channel: Channel | null = null;
  banned_users: Member[] = [];
  channel_users: Member[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["channel"]) {
      this.current_channel = this.channel;
      if (!this.current_channel) return;

      this.banned_users = [];
      this.channel_users = [];

      this.groupService.getChannelMembers(this.current_channel.id).subscribe({
        next: (me) => {
          this.channel_users = me;
        },
        error: (e) => {
          console.log('openGroup Member Error: ', e);
        },
      });

      this.groupService.getBanned(this.current_channel.id).subscribe({
        next: (me) => {
          this.banned_users = me;
        },
        error: (e) => {
          console.log('openGroup Member Error: ', e);
        },
      });
    }
  }

  placeholderAvatar(member: Member): string {
    const role = member?.role ?? member?.role?.[0] ?? 'u';
    return role ? role[0].toUpperCase() : 'U';
  }
}
