import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, inject, Input, OnInit, Output } from '@angular/core';
import { User } from '../../../models/user';
import { DataService } from '../../../services/data.service';
import { Log } from '../../../models/log';

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
  logs: Log[] = [];

  selectedAvatarFile: File | null = null;
  previewAvatarUrl: string | null = null;
  uploading = false;

  @Output() deleteAccount = new EventEmitter<void>();

  ngOnInit(): void {
    if (!this.current_user) return;
    console.log("CURRENT", this.current_user);
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
      error: () => { }
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

  async saveAvatar() {
    if (!this.selectedAvatarFile) return;
    this.uploading = true;

    try {
      // DataService returns an Observable; convert to promise for async/await simplicity
      const res = await this.dataService.uploadAvatarImage(this.selectedAvatarFile).toPromise();

      if (res?.success && res.url) {
        // update current_user in-memory so UI shows new avatar immediately
        if (this.current_user) {
          this.current_user.avatar = res.url;
        }
        // clear preview
        this.cancelAvatar();
      } else {
        console.error('Avatar upload failed', res);
        // show user-friendly UI feedback here if you have a notification system
      }
    } catch (e) {
      console.error('Avatar upload error', e);
    } finally {
      this.uploading = false;
    }
  }

  placeholderAvatar(user: User): string {
    const username = user?.username ?? user?.username?.[0] ?? 'a';
    return username ? username[0].toUpperCase() : 'A';
  }
}
