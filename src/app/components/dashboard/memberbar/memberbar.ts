import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Channel } from '../../../models/channel';
import { GroupService } from '../../../services/group.service';
import { Group } from '../../../models/group';
import { User } from '../../../models/user';

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

  banned_users: User[] = [];
  channel_users: User[] = [];
  available_users: User[] = [];
  all_members: User[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["channel"] || changes['group']) {

      this.banned_users = [];
      this.channel_users = [];
      this.available_users = [];

      if (this.group != null && this.channel != null) {
        this.groupService.getMembers(this.group.id).subscribe({
          next: (me) => {
            // set all members in this group and refresh
            this.all_members = me ?? [];
            this.refresh();
          },
          error: (e) => {
            console.log('member bar Error: ', e);
          },
        });
      }
    }
  }

  refresh() {
    const all = this.all_members;
    const banned_names = (this.channel?.banned_users ?? []) as string[];
    const channel_names = (this.channel?.channel_users ?? []) as string[];

    const banned_members: User[] = [];
    const channel_members: User[] = [];
    const available_members: User[] = [];

    for (let i = 0; i < all.length; i++) {
      const u = all[i];
      const name = u && u.username ? u.username : '';
      if (!name) continue;

      if (banned_names.indexOf(name) !== -1) {
        banned_members.push(u);
      } else if (channel_names.indexOf(name) !== -1) {
        channel_members.push(u);
      } else {
        available_members.push(u);
      }
    }
    this.banned_users = banned_members;
    this.channel_users = channel_members;
    this.available_users = available_members;
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

  setMembership(list: string[], username: string, should_exist: boolean) {
    // to refresh the channel
    const arr = list || [];

    //remove the matched username
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === username) {
        arr.splice(i, 1);
        i++;
      }
    }

    // whether or not added to the array again
    if (should_exist) {
      arr.push(username)
    }
    return arr;
  }

  onAdd(member: User) {
    // check if they exist
    if (this.channel == null) return;
    if (!this.channel.id) return;
    this.groupService.addChannelMember(member.username, this.channel.id).subscribe({
      next: () => {
        // check again
        if (this.channel == null) return;
        if (!this.channel.channel_users) return;
        if (!this.channel.banned_users) return;

        // this is adding member so put it on true
        this.channel.channel_users = this.setMembership(this.channel.channel_users, member.username, true);
        // this is removing bans so put it on false
        this.channel.banned_users = this.setMembership(this.channel.banned_users, member.username, false);

        // refresh the variables
        this.refresh();
      }, error: () => {

      },
    })
  }

  onRemove(member: User) {
    if (!this.channel) return;
    if (!this.channel.id) return;
    this.groupService.removeChannelMember(member.username, this.channel.id).subscribe({
      next: () => {
        // check again
        if (this.channel == null) return;
        if (!this.channel.channel_users) return;

        // this is removing member so put it on false
        this.channel.channel_users = this.setMembership(this.channel.channel_users, member.username, false);

        // refresh the variables
        this.refresh();
      }, error: () => {

      },
    })
  }

  onBan(member: User) {
    if (!this.channel) return;
    if (!this.channel.id) return;
    this.groupService.banMember(member.username, this.channel.id).subscribe({
      next: () => {
        // check again
        if (this.channel == null) return;
        if (!this.channel.channel_users) return;
        if (!this.channel.banned_users) return;

        // this is removing member so put it on false
        this.channel.channel_users = this.setMembership(this.channel.channel_users, member.username, false);
        // this is adding bans so put it on true
        this.channel.banned_users = this.setMembership(this.channel.banned_users, member.username, true);

        // refresh the variables
        this.refresh();
      }, error: () => {

      },
    })
  }

  //if clicked anywhere, close the menu
  @HostListener('document:click')
  closeMenu() {
    this.opened_user = null;
  }

  placeholderAvatar(member: User): string {
    const role = member?.role ?? member?.role?.[0] ?? 'u';
    return role ? role[0].toUpperCase() : 'U';
  }
}
