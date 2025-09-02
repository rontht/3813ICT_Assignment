import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Member } from '../../../models/member';
import { Channel } from '../../../models/channel';
import { GroupService } from '../../../services/group.service';
import { Group } from '../../../models/group';

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
  @Input() group: Group | null = null;
  @Input() can_manage_group!: boolean;

  current_channel: Channel | null = null;
  opened_user: string | null = null;

  banned_users: Member[] = [];
  channel_users: Member[] = [];
  available_users: Member[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["channel"] || changes['group']) {

      this.banned_users = [];
      this.channel_users = [];
      this.available_users = [];



      if (this.group != null && this.channel != null) {
        this.groupService.getMembers(this.group.id).subscribe({
          next: (me) => {
            const all = me ?? [];
            const banned_names = (this.channel?.banned_users ?? []) as string[];
            const channel_names = (this.channel?.channel_users ?? []) as string[];

            const backet_1: Member[] = [];
            const backet_2: Member[] = [];
            const backet_3: Member[] = [];

            for (let i = 0; i < all.length; i++) {
              const u = all[i];
              const name = u && u.username ? u.username : '';
              if (!name) continue;

              if (banned_names.indexOf(name) !== -1) {
                backet_1.push(u);
              } else if (channel_names.indexOf(name) !== -1) {
                backet_2.push(u);
              } else {
                backet_3.push(u);
              }
            }
            this.banned_users = backet_1;
            this.channel_users = backet_2;
            this.available_users = backet_3;
          },
          error: (e) => {
            console.log('member bar Error: ', e);
          },
        });
      }
    }
  }

  toggleMenu(username: string, ev: Event) {
    // prevent the menu from instant closure
    ev.stopPropagation();
    // prevent menu opening again if no permission
    if (!this.can_manage_group) return;

    if (this.opened_user === username) {
      // already open, so close it
      this.opened_user = null;
    } else {
      // open new one, close any previous
      this.opened_user = username;
    }
  }

  onAdd(member: Member) {
    console.log("before")
    if (this.channel == null) return;
    if (!this.channel.id) return;
    console.log("after")
    this.groupService.addChannelMember(member.username, this.channel.id).subscribe({
      next: () => {

      }, error: () => {

      },
    })
  }

  onRemove(member: Member) {
    if (!this.channel) return;
    if (!this.channel.id) return;
    this.groupService.removeChannelMember(member.username, this.channel.id).subscribe({
      next: () => {

      }, error: () => {

      },
    })
  }

  onBan(member: Member) {
    if (!this.channel) return;
    if (!this.channel.id) return;
    this.groupService.banMember(member.username, this.channel.id).subscribe({
      next: () => {

      }, error: () => {

      },
    })
  }

  //if clicked anywhere, close the menu
  @HostListener('document:click')
  closeMenu() {
    this.opened_user = null;
  }

  placeholderAvatar(member: Member): string {
    const role = member?.role ?? member?.role?.[0] ?? 'u';
    return role ? role[0].toUpperCase() : 'U';
  }
}
