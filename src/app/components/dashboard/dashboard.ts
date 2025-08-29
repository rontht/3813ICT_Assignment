import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GroupService } from '../../services/group.service';
import { CommonModule } from '@angular/common';
import { Groupbar } from '../groupbar/groupbar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Groupbar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private groupService = inject(GroupService);
  constructor(private router: Router) {}

  user: any = [];
  groups: any[] = [];
  channels: any[] = [];
  members: any[] = [];

  current_group_id: string | null = null;
  current_channel_id: string | null = null;
  current_channel_name = '';
  current_group_members: any[] = [];

  ngOnInit() {
    // route back to login if unauth
    const user_info = localStorage.getItem('user');
    if (!user_info) {
      this.router.navigate(['']);
      return;
    }
    this.user = JSON.parse(user_info);

    // get all groups that user is apart of
    this.groupService.getGroups().subscribe((groups) => {
      this.groups = groups;

      // get first group the user is apart of
      if (!this.groups.length) return;
      this.current_group_id = this.groups[0].id;
      if (this.current_group_id === null) return;

      // get first channel of that group
      this.groupService.getChannels(this.current_group_id).subscribe((cs) => {
        this.channels = cs;
        if (!this.channels.length) return;
        this.current_channel_id = this.channels[0].id;
        this.current_channel_name = this.channels[0].name;
      });

      // get the members of that group
      this.groupService.getMembers(this.current_group_id).subscribe((me) => {
        this.members = me;
        if (!this.members.length) return;
        this.current_group_members = this.members;
      });
    });
  }

  // get all channels that the group have
  openGroup(group_id: string) {
    this.current_group_id = group_id;

    // get members from that group
    this.groupService.getMembers(group_id).subscribe((me) => {
      this.members = me;
      if (!this.members.length) return;
      this.current_group_members = this.members;
    });

    // find the channels of that group
    this.groupService.getChannels(group_id).subscribe((cs) => {
      this.channels = cs;
      if (!this.channels.length) return;
      this.current_channel_id = this.channels[0].id;
      this.current_channel_name = this.channels[0].name;
    });
  }

  // open a channel
  openChannel(c: any) {
    if (!c) return;
    this.current_channel_id = c.id;
    this.current_channel_name = c.name || '';
  }

  // logout and clear the storage
  onLogout() {
    localStorage.clear();
    this.router.navigate(['']);
  }

  // set id to create and reset everything else
  openCreate() {
    this.current_group_id = 'create';
    this.current_channel_id = null;
    this.current_channel_name = '';
  }
}
