import { Component, Input } from '@angular/core';
import { User } from '../../../models/user';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-manager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-manager.html',
  styleUrl: './user-manager.css',
})
export class UserManager {
  @Input() all_users: User[] = [];
}
