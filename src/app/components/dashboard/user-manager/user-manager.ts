import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { User } from '../../../models/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-user-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-manager.html',
  styleUrl: './user-manager.css',
})
export class UserManager implements OnChanges {
  private dataService = inject(DataService);
  private httpService = inject(HttpService);

  @Input() current_user: User | null = null;
  @Input() all_users: User[] = [];

  filtered_users: User[] = [];
  other_super_admins: User[] = [];
  group_admins: User[] = [];

  name: string = "";
  username: string = "";
  email: string = "";
  password: string = "";
  role: string = "user";

  notification: { message: string; type: 'success' | 'error' } | null = null;
  private notificationTimeout: any;

  ngOnChanges(_changes: SimpleChanges) {
    this.refresh();
  }

  showNotification(message: string, type: 'success' | 'error' = 'success') {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    this.notification = { message, type };
    this.notificationTimeout = setTimeout(() => {
      this.notification = null;
      this.notificationTimeout = null;
    }, 3000);
  }

  refresh() {
    const current_username = this.current_user?.username;
    const users = this.all_users || [];

    this.filtered_users = users.filter(
      u => u && u.username !== current_username && u.role !== 'group-admin' && u.role !== 'super-admin'
    );

    this.group_admins = users.filter(
      u => u && u.username !== current_username && u.role === 'group-admin'
    );

    this.other_super_admins = users.filter(
      u => u && u.username !== current_username && u.role === 'super-admin'
    );
  }

  promote(target_username: string) {
    this.dataService.promoteUser(target_username).subscribe({
      next: updated_user => {
        if (!updated_user) return this.showNotification('Promotion failed', 'error');

        this.all_users = this.all_users.map(u =>
          u.username === updated_user.username ? updated_user : u
        );
        this.refresh();
        this.showNotification(`User ${updated_user.name} has been promoted to ${updated_user.role}.`, 'success');
      },
      error: e => this.showNotification(`Promotion failed: ${e.error.error}`, 'error')
    });
  }

  delete(target_username: string) {
    this.dataService.deleteUser(target_username).subscribe({
      next: () => {
        this.all_users = this.all_users.filter(u => u.username !== target_username);
        this.refresh();
        this.showNotification(`User ${target_username} has been deleted from database.`, 'success');
      },
      error: e => this.showNotification(`Deletion failed: ${e.error.error}`, 'error')
    });
  }

  createAccount() {
    this.httpService.register(this.username, this.name, this.email, this.password, this.role)
      .subscribe({
        next: created_user => {
          if ('valid' in created_user && !created_user.valid) {
            return this.showNotification('Invalid credentials!', 'error');
          }

          const exists = this.all_users.find(x => x.username === created_user.username);
          if (!exists) this.all_users = [created_user, ...this.all_users];

          this.refresh();

          // clear form
          this.name = '';
          this.username = '';
          this.email = '';
          this.password = '';
          this.role = 'user';

          this.showNotification(`User ${created_user.username} has been created.`, 'success');
        },
        error: e => this.showNotification(`Account Creation failed: ${e.error.error}`, 'error')
      });
  }

  placeholderAvatar(user: User): string {
    const username = user?.username ?? user?.username?.[0] ?? 'a';
    return username ? username[0].toUpperCase() : 'A';
  }
}