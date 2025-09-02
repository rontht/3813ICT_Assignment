import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { User } from '../../../models/user';
import { CommonModule } from '@angular/common';
import { GroupService } from '../../../services/group.service';
import { FormsModule } from '@angular/forms';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-user-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-manager.html',
  styleUrl: './user-manager.css',
})
export class UserManager implements OnChanges {
  private groupService = inject(GroupService);
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
  role: string = "";

  ngOnChanges(_changes: SimpleChanges) {
    this.refresh();
  }

  refresh() {
    const current_username = this.current_user?.username;
    this.filtered_users = this.all_users.filter(u => u.username !== current_username && u.role !== 'super-admin' && u.role !== 'group-admin');
    this.other_super_admins = this.all_users.filter(u => u.username !== current_username && u.role === 'super-admin');
    this.group_admins = this.all_users.filter(u => u.username !== current_username && u.role === 'group-admin');
  }

  promote(target_username: string, role: string) {
    this.groupService.promoteUser(target_username, role).subscribe({
      next: (updated_user) => {
        const index = this.all_users.findIndex(x => x.username === target_username);
        if (index !== -1) {
          this.all_users[index] = { ...this.all_users[index], ...updated_user };
          this.refresh();
        }
      },
      error: (e) => {

      }
    });
  }

  delete(target_username: string) {
    this.groupService.deleteUser(target_username).subscribe({
      next: (response) => {
        this.all_users = this.all_users.filter(x => x.username !== target_username);
        this.refresh();
      },
      error: (e) => {

      }
    });
  }

  createAccount() {
    this.httpService.register(this.username, this.name, this.email, this.password, this.role).subscribe({
      next: (created_user) => {
        if ('valid' in created_user && !created_user.valid) {
          console.log("Invalid Credentials!");
          return;
        }
        // this.all_users push the new created user
        const index = this.all_users.findIndex(x => x.username === created_user.username);
        if (index === -1) {
          this.all_users = [created_user, ...this.all_users];
        } else {
          console.log("create user already exist")
        }
        // clear form and refresh
        this.refresh();
        this.name = '';
        this.username = '';
        this.email = '';
        this.password = '';
        this.role = 'user';
      },
      error: (e) => {

      }
    });
  }
}
