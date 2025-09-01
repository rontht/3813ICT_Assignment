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
  current_channels: Channel[] = [];

  group_name: string | undefined = "";

  error: string = "";
  opened_channel: string | null = null;
  show_add_channel_menu = false;
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

    // Recompute members/available whenever either all_users or current_group changes
    if (changes['all_users']) {
      const copy = (this.all_users ?? []).slice();
      const memberKeys = new Set<string>(
        (this.current_group?.members ?? []).map(m => (m as any).username ?? (m as any).id ?? m)
      );

      // Helper to get a consistent key from a User
      const keyOf = (u: User) => (u as any).username ?? (u as any).id;

      // Members = users whose key is in memberKeys
      const members = copy.filter(u => memberKeys.has(keyOf(u)));
      // Available = users not in the group
      const available = copy.filter(u => !memberKeys.has(keyOf(u)));

      // Assign
      this.new_user_array = members;
      this.old_user_array = available;
    }
  }

  addChannel() {

  }

  toggleMenu(channel_id: string, ev: Event) {
    // prevent the menu from instant closure
    ev.stopPropagation();

    if (this.opened_channel === channel_id) {
      // already open, so close it
      this.opened_channel = null;
    } else {
      // open new one, close any previous
      this.opened_channel = channel_id;
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
    this.opened_channel = null;
    this.show_add_channel_menu = false;
  }

  deleteChannel(channel: Channel) {

  }

  private key(u: User) { return (u as any).id ?? (u as any).username; }
  private has(arr: User[], u: User) {
    const k = this.key(u);
    return arr.some(x => this.key(x) === k);
  }
  private remove(arr: User[], u: User) {
    const k = this.key(u);
    const i = arr.findIndex(x => this.key(x) === k);
    if (i >= 0) arr.splice(i, 1);
  }

  addMember(member: User): void {
    if (!member) return;
    // prevent dupes in selected
    if (!this.has(this.new_user_array, member)) {
      this.new_user_array.push(member);
    }
    // remove from available
    this.remove(this.old_user_array, member);
  }

  // Remove from new_user_array -> old_user_array
  removeMember(member: User): void {
    if (!member) return;
    // prevent dupes in available
    if (!this.has(this.old_user_array, member)) {
      this.old_user_array.push(member);
    }
    // remove from selected
    this.remove(this.new_user_array, member);
  }

  saveGroup() {
    const g_name = this.group_name?.trim();
    const g_members = (this.new_user_array ?? []).map(u => u.username);
    const g_channels = this.current_channels ?? [];

    if (!g_name) {
      this.error = 'Group name is required';
      return;
    }

    const new_channels = g_channels.filter(c => c.newly_added && !c.id).map(c => c.name);
    const existing_channels = g_channels.filter(c => !c.newly_added && c.id).map(c => c.id!);

    const group: Group = {
      name: g_name,
      members: g_members,
      channels: existing_channels
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
          if (edited_group.id != undefined) {
            for (let ch of new_channels) {
              this.groupService.createChannel(ch, edited_group.id).subscribe({
                next: (added_channel) => { },
                error: (e) => { }
              });
            }
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
