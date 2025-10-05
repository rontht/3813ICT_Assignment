import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { User } from '../../../models/user';
import { DataService } from '../../../services/data.service';
import { Log } from '../../../models/log';
import { Notification } from '../../notification/notification';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, Notification],
  templateUrl: './account-settings.html',
  styleUrl: './account-settings.css'
})
export class AccountSettings implements OnInit {
  private dataService = inject(DataService);

  @ViewChild('noti') noti!: Notification;

  @Input() current_user: User | null = null;
  @Input() is_super: boolean = true;

  confirm_menu_open: boolean = false;
  logs: Log[] = [];

  selectedAvatarFile: File | null = null;
  previewAvatarUrl: string | null = null;
  uploading = false;

  @Output() deleteAccount = new EventEmitter<void>();

  ngOnInit(): void {
    if (!this.current_user) {
      this.noti.showError("Authication error, Try again later");
      return;
    }
    if (this.current_user.role === "super-admin") {
      this.dataService.getLogs().subscribe({
        next: (logs) => {
          this.logs = logs;
        },
        error: (e) => {
          console.log("log error", e);
          this.noti.showError("Error while loading you info, Try again later");
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
        this.noti.showConfirm("You have deactivated your account.");
        this.deleteAccount.emit();
      },
      error: () => {
        this.noti.showError("Error while deactivating your account.");
      }
    });
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    // only keep the first file
    this.selectedAvatarFile = input.files[0];
    // revoke old URL if exists
    if (this.previewAvatarUrl) URL.revokeObjectURL(this.previewAvatarUrl);
    this.previewAvatarUrl = URL.createObjectURL(this.selectedAvatarFile);
  }

  cancelAvatar() {
    this.selectedAvatarFile = null;
    if (this.previewAvatarUrl) {
      URL.revokeObjectURL(this.previewAvatarUrl);
      this.previewAvatarUrl = null;
    }
  }

  saveAvatar() {
    if (!this.selectedAvatarFile) {
      this.noti.showWarning("Please make some changes first.");
      return;
    }
    this.uploading = true;

    this.dataService.uploadAvatarImage(this.selectedAvatarFile).subscribe({
      next: (res) => {
        if (res?.success && res.url) {
          if (this.current_user) {
            this.current_user.avatar = res.url;
          }
          // clear preview on success
          this.cancelAvatar();
          this.noti.showConfirm("Avatar updated successfully.")
        } else {
          console.error('Avatar upload failed', res);
          this.noti.showError("Error while uploading your avatar. Please try again later.");
        }
      },
      error: (e) => {
        this.noti.showError("Error while uploading your avatar. Please try again later.")
        console.error('Avatar upload error', e);
      },
      complete: () => {
        this.uploading = false;
      }
    });
  }

  placeholderAvatar(user: User): string {
    const username = user?.username ?? user?.username?.[0] ?? 'a';
    return username ? username[0].toUpperCase() : 'A';
  }
}
