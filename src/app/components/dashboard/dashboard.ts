import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// Services
import { GroupService } from '../../services/group.service';

// Models
import { User } from '../../models/user';
import { Group } from '../../models/group';
import { Channel } from '../../models/channel';
import { Member } from '../../models/member';

// Components
import { Groupbar } from './groupbar/groupbar';
import { Channelbar } from './channelbar/channelbar';
import { Memberbar } from './memberbar/memberbar';
import { UserManager } from './user-manager/user-manager';
import { Groups } from '../../models/groups';
import { GroupSearch } from "./group-search/group-search";
import { Chat } from './chat/chat';
import { CreateGroup } from './create-group/create-group';
import { GroupSettings } from './group-settings/group-settings';
import { AccountSettings } from './account-settings/account-settings';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Groupbar, Channelbar, Memberbar, UserManager, GroupSearch, Chat, CreateGroup, AccountSettings],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private groupService = inject(GroupService);
  constructor(private router: Router) { }

  user: User | null = null;
  groups: Group[] = [];
  all_groups: Groups[] = [];
  channels: Channel[] = [];
  members: Member[] = [];
  requests: Member[] = [];
  banned_users: Member[] = [];
  all_users: User[] = [];

  current_group: Group | null = null;
  current_channel: Channel | null = null;

  show_group_settings: boolean = false;
  create_new_group: boolean = false;

  // ____________ Check Permissions ____________ //
  // check user's role, false by default
  isSuperAdmin() {
    if (this.user?.role === 'super-admin') return true;
    return false;
  }
  isGroupAdmin() {
    if (this.user?.role === 'group-admin') return true;
    return false;
  }
  // check if they have group admin rights for certain groups
  canManageGroup() {
    const user = this.user;
    const group =
      this.groups.find((g) => g.id === this.current_group!.id) ?? null;
    // if undefine or null, false
    if (!user || !group) return false;
    // check super admin as they can manage regardless
    if (user.role === 'super-admin') return true;
    // check group admin
    if (user.role === 'group-admin' && group.creator === user.username) return true;
    // false by default
    return false;
  }
  // check if they can create groups
  canCreateGroup() {
    if (this.isSuperAdmin() || this.isGroupAdmin()) {
      return true;
    }
    return false;
  }

  // ____________ ngOnInit ____________ //
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

        // default open the first group upon log in
        if (this.groups.length) {
          this.openGroup(this.groups[0]);
        }
      },
      error: (e) => {
        console.log('ngOnInit Group Error: ', e);
      },
    });
  }

  // ____________ Functions ____________ //
  reset() {
    this.channels = [];
    this.members = [];
    this.requests = [];
    this.banned_users = [];
    this.current_channel = null;
    this.show_group_settings = false;
  }

  // get all channels that the group have
  openGroup(group: Group | null) {
    // reset before change
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

    // get requests from that group
    this.groupService.getRequests(group_id).subscribe({
      next: (re) => {
        // in case of mismatch during async
        if (this.current_group?.id !== group_id) return;
        this.requests = re;
        if (!this.requests.length) return;
        this.current_group!.requests = this.requests;
      },
      error: (e) => {
        console.log('openGroup Request Error: ', e);
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
        
        // find the banned users of that channel
        this.groupService.getBanned(this.current_channel.id).subscribe({
          next: (bn) => {
            // in case of mismatch during async
            if (this.current_channel?.group_id !== group_id) return;
            this.banned_users = bn;
            if (!this.banned_users.length) return;
            this.current_channel!.banned_users = this.banned_users;
          },
          error: (e) => {
            console.log('openGroup Request Error: ', e);
          },
        });
      },
      error: (e) => {
        console.log('openGroup Channel Error: ', e);
      },
    });

  }

  // open a channel
  openChannel(channel: Channel | null) {
    this.show_group_settings = false;
    if (channel) this.current_channel = channel;
  }

  // open account settings
  openAccountSettings() {
    this.reset();
    this.current_group = {
      id: 'account',
      name: '',
      creator: this.user?.username ?? '',
      channels: [],
      members: [],
      requests: []
    };
  }

  // logout and clear the storage
  onLogout() {
    localStorage.clear();
    this.router.navigate(['']);
  }

  // creating new groups
  openGroupCreate(create_new: boolean) {
    this.reset();
    this.current_group = {
      id: 'create',
      name: '',
      creator: this.user?.username ?? '',
      channels: [],
      members: [],
      requests: []
    };
    this.channels = [];

    this.groupService.getAllUsers().subscribe({
      next: (users) => {
        this.all_users = users;
      },
      error: (e) => {
        console.log('openManageUsers Error: ', e);
      },
    });

    this.create_new_group = create_new;
  }

  reloadGroups(created_group: Group) {
    this.groupService.getGroups().subscribe({
      next: (groups) => {
        this.groups = groups;

        // default open the first group upon log in
        if (this.groups.length) {
          this.openGroup(created_group);
        }
      },
      error: (e) => {
        console.log('ngOnInit Group Error: ', e);
      },
    });
  }

  // finding groups
  openGroupSearch() {
    this.reset();
    this.current_group = {
      id: 'search',
      name: '',
      creator: this.user?.username ?? '',
      channels: [],
      members: [],
      requests: []
    };
    this.groupService.getAllGroupsForSearch().subscribe({
      next: (groups) => {
        this.all_groups = groups
      },
      error: (e) => {
        console.log('openGroupSearch Error: ', e);
      },
    })
  }

  // superadmin managing users in the server
  openManageUsers() {
    this.reset();
    this.current_group = {
      id: 'users',
      name: '',
      creator: this.user?.username ?? '',
      channels: [],
      members: [],
      requests: []
    };
    this.groupService.getAllUsers().subscribe({
      next: (users) => {
        this.all_users = users;
      },
      error: (e) => {
        console.log('openManageUsers Error: ', e);
      },
    });
  }
  promoteUser(user: User) {
    console.log("Promoted ", user.username);
  }

  // open group settings
  toggleGroupSettings() {
    this.show_group_settings = !this.show_group_settings;
  }

  openGroupEdit() {
    this.groupService.getAllUsers().subscribe({
      next: (users) => {
        this.all_users = users;
      },
      error: (e) => {
        console.log('openManageUsers Error: ', e);
      },
    });

    console.log("finished");

    this.create_new_group = false;
    this.show_group_settings = true;
  }

  closeGroupEdit(group: Group) {
    this.show_group_settings = false;
    this.openGroup(group);
  }

  // group member management
  banMember(member: Member) {
    console.log("Banned ", member.username);
  }
  kickMember(member: Member) {
    console.log("Kicked ", member.username);
  }
  unbanMember(member: Member) {
    console.log("unbanned ", member.username);
  }
  approveMember(member: Member) {
    console.log("approve ", member.username);
  }
}
