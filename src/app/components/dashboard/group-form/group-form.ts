import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Channel } from '../../../models/channel';
import { User } from '../../../models/user';
import { GroupService } from '../../../services/group.service';
import { Group } from '../../../models/group';

@Component({
  selector: 'app-group-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './group-form.html',
  styleUrl: './group-form.css'
})
export class GroupForm implements OnChanges {
  private groupService = inject(GroupService);

  @Input() current_group: Group | null = null;
  @Input() all_users: User[] = [];
  @Input() channels: Channel[] = [];
  @Input() create_new: boolean = false;

  @Output() reloadGroups = new EventEmitter<Group>();
  @Output() closeEdit = new EventEmitter<Group>();

  old_user_array: User[] = [];
  new_user_array: User[] = [];
  requested_array: User[] = [];
  approved_array: User[] = [];
  current_channels: Channel[] = [];
  channels_to_delete: Channel[] = [];

  group_name: string | undefined = "";

  error: string = "";
  show_add_channel_menu = false;
  opened_channel: string = "";
  new_channel_name = '';
  select_tab: number = 1;

  // solution for async issues
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['current_group']) {
      this.group_name = this.current_group?.name ?? '';
    }
    if (changes['channels']) {
      this.current_channels = this.channels ?? [];
    }

    if (changes['all_users'] || changes['current_group']) {
      const all = this.all_users ?? [];
      const memberNames = (this.current_group?.members ?? []) as string[];
      const requestNames = (this.current_group?.requests ?? []) as string[];

      // Buckets (reset)
      this.new_user_array = [];
      this.requested_array = [];
      this.old_user_array = [];

      // Classify each user by username
      for (let i = 0; i < all.length; i++) {
        const u = all[i];
        const name = u && u.username ? u.username : '';
        if (!name) continue;

        if (memberNames.indexOf(name) !== -1) {
          this.new_user_array.push(u);
        } else if (requestNames.indexOf(name) !== -1) {
          this.requested_array.push(u);
        } else {
          this.old_user_array.push(u);
        }
      }
    }
  }

  toggleMenu(id: string, ev: Event) {
    ev.stopPropagation();
    if (this.opened_channel != "") {
      this.opened_channel = "";
    } else {
      this.opened_channel = id;
    }
  }

  toggleAddChannel(ev: Event) {
    ev.stopPropagation();
    this.show_add_channel_menu = !this.show_add_channel_menu;
  }

  changeTab(id: number) {
    console.log(id);
    this.select_tab = id;
  }

  confirmAddChannel() {
    const name = this.new_channel_name.trim();
    if (!name) return;

    // push a temp/new channel
    this.current_channels = [
      ...(this.current_channels ?? []),
      { name, newly_added: true } as Channel,
    ];

    this.new_channel_name = '';
    this.show_add_channel_menu = false;
  }

  //if clicked anywhere, close the menu
  @HostListener('document:click')
  closeMenu() {
    this.show_add_channel_menu = false;
    this.opened_channel = "";
  }

  // For Channels
  removeFromChannels(chs: Channel[], ch: Channel) {
    if (chs && chs.length) {
      for (let i = 0; i < chs.length; i++) {
        const channel = chs[i];
        const matched = channel?.id === ch.id
        if (matched) {
          chs.splice(i, 1);
          break;
        }
      }
    }
  }
  addToChannels(chs: Channel[], ch: Channel) {
    if (ch.id) {
      let already_added = false;
      // check for duplicates
      if (chs && chs.length) {
        for (let j = 0; j < chs.length; j++) {
          const channel = chs[j];
          if (channel && channel.id === ch.id) {
            already_added = true;
            break;
          }
        }
      }
      // if no duplicate, add it
      if (!already_added) {
        chs.push(ch);
      }
    }
  }
  moveToDelete(channel_to_delete: Channel) {
    if (!channel_to_delete) return;
    this.removeFromChannels(this.current_channels, channel_to_delete);
    this.addToChannels(this.channels_to_delete, channel_to_delete);
    this.opened_channel = "";
  }
  removeFromDelete(channel_to_remove: Channel) {
    if (!channel_to_remove) return;
    this.removeFromChannels(this.channels_to_delete, channel_to_remove);
    this.addToChannels(this.current_channels, channel_to_remove);
    this.opened_channel = "";
  }

  // For Users
  removeFromUsers(us: User[], u: User) {
    if (us && us.length) {
      for (let i = 0; i < us.length; i++) {
        const user = us[i];
        const matched = user?.username === u.username
        if (matched) {
          us.splice(i, 1);
          break;
        }
      }
    }
  }
  addToUsers(us: User[], u: User) {
    if (u.username) {
      let already_added = false;
      // check for duplicates
      if (us && us.length) {
        for (let j = 0; j < us.length; j++) {
          const user = us[j];
          if (user && user.username === u.username) {
            already_added = true;
            break;
          }
        }
      }
      // if no duplicate, add it
      if (!already_added) {
        us.push(u);
      }
    }
  }
  addMember(member: User) {
    if (!member) return;
    this.addToUsers(this.new_user_array, member);
    this.removeFromUsers(this.old_user_array, member);
  }
  approveMember(member: User) {
    if (!member || !member.username) return;
    // add to selected members (no dupes)
    this.addToUsers(this.new_user_array, member);
    // track temp approvals for undo-on-remove
    this.addToUsers(this.approved_array, member);
    // remove from requests and available
    this.removeFromUsers(this.requested_array, member);
    this.removeFromUsers(this.old_user_array, member);
  }
  removeMember(member: User) {
    if (!member || !member.username) return;
    // check if they are already temp approved
    let temp_approved = false;
    if (this.approved_array && this.approved_array.length) {
      for (let i = 0; i < this.approved_array.length; i++) {
        const u = this.approved_array[i];
        if (u && u.username === member.username) {
          temp_approved = true;
          break;
        }
      }
    }
    // remove from selected
    this.removeFromUsers(this.new_user_array, member);
    if (temp_approved) {
      // send back to requests and clear temp approval
      this.addToUsers(this.requested_array, member);
      this.removeFromUsers(this.approved_array, member);
    } else {
      // not temp-approved, return to available
      this.addToUsers(this.old_user_array, member);
    }
  }

  saveGroup() {
    const g_name = this.group_name?.trim();
    const g_members = (this.new_user_array ?? []).map(u => u.username);
    const g_channels = this.current_channels ?? [];

    if (!g_name) {
      this.error = 'Group name is required';
      return;
    }

    // const new_channels = g_channels.filter(c => c.newly_added && !c.id).map(c => c.name);

    // new channels to add
    const new_channels: string[] = [];
    for (let i = 0; i < g_channels.length; i++) {
      const c = g_channels[i];
      if (c && c.newly_added && !c.id && c.name) new_channels.push(c.name);
    }

    // channels to delete
    const delete_channels: string[] = [];
    for (let i = 0; i < this.channels_to_delete.length; i++) {
      const c = this.channels_to_delete[i];
      if (c && c.id) delete_channels.push(c.id);
    }

    let approved_users: string[] = [];
    if (this.approved_array && this.approved_array.length) {
      for (let i = 0; i < this.approved_array.length; i++) {
        const u = this.approved_array[i];
        if (u && u.username) approved_users.push(u.username);
      }
    }

    let requests: string[] = [];
    if (this.requested_array && this.requested_array.length) {
      for (let i = 0; i < this.requested_array.length; i++) {
        const u = this.requested_array[i];
        if (u && u.username) requests.push(u.username);
      }
    }

    let remaining_requests: string[] = [];
    for (let i = 0; i < requests.length; i++) {
      const name = requests[i];
      if (g_members.indexOf(name) === -1 && approved_users.indexOf(name) === -1) {
        remaining_requests.push(name);
      }
    }

    const group: Group = {
      name: g_name,
      members: g_members,
      requests: remaining_requests
    };

    if (this.create_new) {
      this.groupService.createGroup(group).subscribe({
        next: (created_group) => {
          if (created_group.id != undefined) {
            for (let ch of new_channels) {
              this.groupService.createChannel(ch, created_group.id).subscribe({
                next: (added_channel) => { },
                error: (e) => { }
              });
            }
          }
          this.reloadGroups.emit(created_group);
        },
        error: (e) => {
          this.error = e?.error?.error || e.message || 'Failed to create group';
        },
      });
    } else {
      var current_group_id = "";
      if (this.current_group != undefined || this.current_group != null) {
        if (this.current_group.id != null) {
          current_group_id = this.current_group.id;
        } else {
          console.log("Current Group id is null while editing groups")
        }
      } else {
        console.log("Current Group is null while editing groups")
      }

      this.groupService.editGroup(current_group_id, group).subscribe({
        next: (edited_group) => {
          const group_id = edited_group?.id || current_group_id;
          for (let ch of new_channels) {
            this.groupService.createChannel(ch, group_id).subscribe({
              next: (added_channel) => { },
              error: (e) => { }
            });
          }
          for (let ch of delete_channels) {
            this.groupService.deleteChannel(ch).subscribe({
              next: () => { },
              error: () => { }
            });
          }
          this.reloadGroups.emit(edited_group);
        },
        error: (e) => {
          this.error = e?.error?.error || e.message || 'Failed to edit a group';
        },
      });
    }
  }

  cancel(group: Group | null) {
    if (group != null) {
      this.closeEdit.emit(group);
    } else {
      console.log("Something happened");
    }
  }
}
