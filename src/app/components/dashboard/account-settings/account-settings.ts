import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, inject, Input, Output } from '@angular/core';
import { User } from '../../../models/user';
import { GroupService } from '../../../services/group.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-settings.html',
  styleUrl: './account-settings.css'
})
export class AccountSettings {
  private groupService = inject(GroupService);
  constructor(private router: Router) { }

  @Input() current_user: User | null = null;
  @Input() is_super: boolean = true;
  confirm_menu_open: boolean = false;

  @Output() deleteAccount = new EventEmitter<void>();

  askConfirm(ev: Event) {
    // prevent the menu from instant closure
    ev.stopPropagation();
    this.confirm_menu_open = !this.confirm_menu_open
  }

  @HostListener('document:click')
  cancel() {
    this.confirm_menu_open = false;
  }

  deactivateAccount(user: User) {
    if (!user) return;
    if (!user.username) return;

    this.groupService.deleteUser(user.username).subscribe({
      next: (res) => {
        this.deleteAccount.emit();
      },
      error: () => {}
    });
  }
}
