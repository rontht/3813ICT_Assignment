import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, inject, Input, OnInit, Output } from '@angular/core';
import { User } from '../../../models/user';
import { DataService } from '../../../services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-settings.html',
  styleUrl: './account-settings.css'
})
export class AccountSettings implements OnInit {
  private dataService = inject(DataService);

  @Input() current_user: User | null = null;
  @Input() is_super: boolean = true;
  confirm_menu_open: boolean = false;

  logs: string[] = [];

  @Output() deleteAccount = new EventEmitter<void>();

  ngOnInit(): void {
    if (!this.current_user) return;
    if (this.current_user.role === "super-admin") {
      this.dataService.getLogs().subscribe({
        next: (logs) => {
          this.logs = logs;
        },
        error: (e) => {
          console.log("log error", e);
        }
      });
    }
  }

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

    this.dataService.deleteUser(user.username).subscribe({
      next: (res) => {
        this.deleteAccount.emit();
      },
      error: () => {}
    });
  }
}
