import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Member } from '../../../models/member';
import { Channel } from '../../../models/channel';
import { Group } from '../../../models/group';

@Component({
  selector: 'app-memberbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './memberbar.html',
  styleUrl: './memberbar.css'
})
export class Memberbar {
  @Input() current_group: Group | null = null;
  @Input() current_channel: Channel | null = null;
  @Input() can_manage_group!: boolean;

  @Output() banMember = new EventEmitter<Member>();
  @Output() kickMember = new EventEmitter<Member>();
  @Output() unbanMember = new EventEmitter<Member>();
  @Output() approveMember = new EventEmitter<Member>();

  manage_user_opened: string | null = null;
  banned_user_opened: string | null = null;
  requested_user_opened: string | null = null;

  toggleManageMenu(username: string, ev: Event) {
    // prevent the menu from instant closure
    ev.stopPropagation();
    // prevent menu opening again if no permission
    if (!this.can_manage_group) return;

    if (this.manage_user_opened === username) {
      // already open, so close it
      this.manage_user_opened = null;
    } else {
      // open new one, close any previous
      this.manage_user_opened = username;
    }
    this.banned_user_opened = null;
    this.requested_user_opened = null;
  }

  toggleBannedMenu(username: string, ev: Event) {
    // prevent the menu from instant closure
    ev.stopPropagation();
    // prevent menu opening again if no permission
    if (!this.can_manage_group) return;

    if (this.banned_user_opened === username) {
      // already open, so close it
      this.banned_user_opened = null;
    } else {
      // open new one, close any previous
      this.banned_user_opened = username;
    }
    this.manage_user_opened = null;
    this.requested_user_opened = null;
  }

  toggleRequestMenu(username: string, ev: Event) {
    // prevent the menu from instant closure
    ev.stopPropagation();
    // prevent menu opening again if no permission
    if (!this.can_manage_group) return;

    if (this.requested_user_opened === username) {
      // already open, so close it
      this.requested_user_opened = null;
    } else {
      // open new one, close any previous
      this.requested_user_opened = username;
    }
    this.manage_user_opened = null;
    this.banned_user_opened = username;
  }

  onBan(member: Member) {
    this.banMember.emit(member);
    this.manage_user_opened = null;
  }
  onKick(member: Member) {
    this.kickMember.emit(member);
    this.manage_user_opened = null;
  }
  onUnban(member:Member) {
    this.unbanMember.emit(member);
    this.banned_user_opened = null;
  }
  onApprove(member:Member) {
    this.approveMember.emit(member);
    this.requested_user_opened = null;
  }

  //if clicked anywhere, close the menu
  @HostListener('document:click')
  closeMenu() {
    this.manage_user_opened = null;
    this.banned_user_opened = null;
    this.requested_user_opened = null;
  }

  placeholderAvatar(member: Member): string {
    const role = member?.role ?? member?.role?.[0] ?? 'u';
    return role ? role[0].toUpperCase() : 'U';
  }
}
