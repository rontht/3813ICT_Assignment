import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Member } from '../../../models/member';

@Component({
  selector: 'app-memberbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './memberbar.html',
  styleUrl: './memberbar.css'
})
export class Memberbar {
  @Input() current_group_members: Member[] = [];
  @Input() can_manage_group!: boolean;


  @Output() banMember = new EventEmitter<Member>();
  @Output() kickMember = new EventEmitter<Member>();

  opened_user: string | null = null;

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

  onBan(member: Member) {
    this.banMember.emit(member);
    this.opened_user = null;
  }
  onKick(member: Member) {
    this.kickMember.emit(member);
    this.opened_user = null;
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
