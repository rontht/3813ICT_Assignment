import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Channel } from '../../../models/channel';
import { Group } from '../../../models/group';
import { User } from '../../../models/user';
import { DataService } from '../../../services/data.service';
import { Notification } from '../../notification/notification';
import { SocketsService } from '../../../services/sockets.service';

@Component({
  selector: 'app-channelbar',
  standalone: true,
  imports: [CommonModule, Notification],
  templateUrl: './channelbar.html',
  styleUrl: './channelbar.css',
})
export class Channelbar implements OnChanges, OnInit {
  private dataService = inject(DataService);
  private socketService = inject(SocketsService);

  @ViewChild('noti') noti!: Notification;

  @Input() user: User | null = null;
  @Input() channels: Channel[] = [];
  @Input() current_channel: Channel | null = null;
  @Input() current_group: Group | null = null;
  @Input() can_manage_group!: boolean;

  @Output() openChannel = new EventEmitter<Channel>();
  @Output() openGroupEdit = new EventEmitter<void>();
  @Output() reloadGroups = new EventEmitter<null>();

  confirm_menu_open: boolean = false;
  is_member: boolean | undefined = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['current_group'] || changes['user']) {
      if (!this.current_group || !this.user) return;

      const match = this.current_group.members?.includes(this.user.username);
      this.is_member = match;
    }
  }

  ngOnInit(): void {
    // notify other user join to this user current channel
    this.socketService.onSystemMessage().subscribe(msg => {
      if (msg.channel_id === this.current_channel?.id) {
        this.noti?.showConfirm(msg.message);
      }
    });
  }

  // show only channels you can see
  get available_channels() {
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

  askConfirm(ev: Event) {
    // prevent the menu from instant closure
    ev.stopPropagation();
    this.confirm_menu_open = !this.confirm_menu_open
  }

  //if clicked anywhere, close the menu
  @HostListener('document:click')
  cancel() {
    this.confirm_menu_open = false;
  }

  confirm(group: Group) {
    if (!group) return;
    if (!group.id) return;

    this.dataService.leaveGroup(group.id).subscribe({
      next: (res) => {
        this.noti?.showConfirm(`You have left the ${group.name}.`);
        this.reloadGroups.emit(null);
      },
      error: (e) => {
        this.noti.showError("Error while leaving the group. Try again later!");
      }
    });
  }
}
