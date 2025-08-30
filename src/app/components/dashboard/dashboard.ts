import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// Services
import { GroupService } from '../../services/group.service';

// Components
import { Groupbar } from './groupbar/groupbar';
import { Channelbar } from './channelbar/channelbar';
import { Memberbar } from './memberbar/memberbar';

// Models
import { User } from '../../models/user';
import { Group } from '../../models/group';
import { Channel } from '../../models/channel';
import { Member } from '../../models/member';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Groupbar, Channelbar, Memberbar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private groupService = inject(GroupService);
  constructor(private router: Router) {}

  user: User | null = null;
  groups: Group[] = [];
  channels: Channel[] = [];
  members: Member[] = [];

  current_group: Group | null = null;
  current_channel: Channel | null = null;

  show_group_settings: boolean = false;

  ngOnInit() {
    // route back to login if unauth
    const user_info = localStorage.getItem('user');
    if (!user_info) {
      this.router.navigate(['']);
      return;
    }
    this.user = JSON.parse(user_info);

    // get all groups that user is apart of
    this.groupService.getGroups().subscribe({
      next: (groups) => {
        this.groups = groups;

        // get first group the user is apart of
        if (!this.groups.length) return;
        this.current_group = this.groups[0];
        if (this.current_group === null) return;
        const group_id = this.current_group.id;

        // get first channel of that group
        this.groupService.getChannels(group_id).subscribe({
          next: (cs) => {
            // in case of mismatch during async
            if (this.current_group?.id !== group_id) return;
            this.channels = cs;
            if (!this.channels.length) return;
            this.current_channel = this.channels[0];
          },

          error: (e) => {
            console.log('ngOnInit Channel Error: ', e);
          },
        });

        // get the members of that group
        this.groupService.getMembers(group_id).subscribe({
          next: (me) => {
            // in case of mismatch during async
            if (this.current_group?.id !== group_id) return;
            this.members = me;
            if (!this.members.length) return;
            this.current_group!.members = this.members;
          },
          error: (e) => {
            console.log('ngOnInit Member Error: ', e);
          },
        });
      },
      error: (e) => {
        console.log('ngOnInit Group Error: ', e);
      },
    });
  }

  reset() {
    this.channels = [];
    this.members = [];
    this.current_channel = null;
    this.show_group_settings = false;
  }

  // get all channels that the group have
  openGroup(group: Group | null) {
    // reset everything
    this.reset();

    //assign group
    if (!group) return;
    this.current_group = group;
    const group_id = group.id;

    // get members from that group
    this.groupService.getMembers(group_id).subscribe({
      next: (me) => {
        // in case of mismatch during async
        if (this.current_group?.id !== group_id) return;
        this.members = me;
        if (!this.members.length) return;
        this.current_group!.members = this.members;
      },
      error: (e) => {
        console.log('openGroup Member Error: ', e);
      },
    });

    // find the channels of that group and default open first channel
    this.groupService.getChannels(group_id).subscribe({
      next: (cs) => {
        // in case of mismatch during async
        if (this.current_group?.id !== group_id) return;
        this.channels = cs;
        if (!this.channels.length) return;
        this.current_channel = this.channels[0];
      },
      error: (e) => {
        console.log('openGroup Channel Error: ', e);
      },
    });
  }

  // open a channel
  openChannel(channel: Channel | null) {
    if (channel) this.current_channel = channel;
  }

  // logout and clear the storage
  onLogout() {
    localStorage.clear();
    this.router.navigate(['']);
  }

  // set id to create and creator to current user
  openCreate() {
    this.reset();
    this.current_group = {
      id: 'create',
      name: '',
      creator: this.user?.id ?? '',
      channels: [],
      members: [],
    };
  }

  toggleGroupSettings() {
    this.show_group_settings = !this.show_group_settings;
  }

  // ____________ Check Permissions ____________ //
  // check user's role, false by default
  isSuperAdmin(): boolean {
    if (this.user?.role === 'super-admin') return true;
    return false;
  }
  isGroupAdmin(): boolean {
    if (this.user?.role === 'group-admin') return true;
    return false;
  }
  // check if they have admin rights
  canManageGroup(): boolean {
    const user = this.user;
    const group =
      this.groups.find((g) => g.id === this.current_group!.id) ?? null;
    // if undefine or null, false
    if (!user || !group) return false;
    // check super admin as they can manage regardless
    if (user.role === 'super-admin') return true;
    // check group admin
    if (user.role === 'group-admin' && group.creator === user.id) return true;
    // false by default
    return false;
  }
}
