import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GroupService } from '../../services/group.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private groupService = inject(GroupService);
  constructor(private router: Router) {}

  groups: any[] = [];
  channels: any[] = [];
  user:any = [];

  current_group_id: string | null = null;
  current_channel_id: string | null = null;
  current_channel_name = '';

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

      // get first channel of that group
      if (this.current_group_id === null) return;
      this.groupService.getChannels(this.current_group_id).subscribe((cs) => {
        this.channels = cs;
        if (!this.channels.length) return;
        this.current_channel_id = this.channels[0].id;
      });
    });
  }

  // get all channels that the group have
  openGroup(group_id: string) {
    this.current_group_id = group_id;
    this.groupService.getChannels(group_id).subscribe((cs) => {
      this.channels = cs;
      if (!this.channels.length) return;
      this.current_channel_id = this.channels[0].id;
    });
  }

  openChannel(c: any) {
    if (!c) return;
    this.current_channel_id = c.id;
    this.current_channel_name = c.name || '';
  }

  // logout
  onLogout() {
    localStorage.clear();
    this.router.navigate(['']);
  }

  get canCreateChannel(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user || !this.current_group_id) return false;
    const group = this.groups.find((g) => g.id === this.current_group_id);
    if (!group) return false;
    const isSuper = user.roles?.includes('super-admin');
    const isCreator = group.creator === user.id;
    return !!(isSuper || isCreator);
  }

  openCreate() {
    this.current_group_id = 'create';
  }
}
