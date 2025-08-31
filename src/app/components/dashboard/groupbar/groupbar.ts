import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from '../../../models/user';
import { Group } from '../../../models/group';

@Component({
  selector: 'app-groupbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './groupbar.html',
  styleUrl: './groupbar.css',
})
export class Groupbar {
  @Input() user!: User;
  @Input() groups: Group[] = [];
  @Input() current_group: Group | null = null;
  @Input() can_create_group!: boolean;
  @Input() is_super_admin!: boolean;

  @Output() openGroup = new EventEmitter<Group>();
  @Output() onLogout = new EventEmitter<void>();
  @Output() openGroupCreate = new EventEmitter<void>();
  @Output() openManageUsers = new EventEmitter<void>();
  @Output() openGroupSearch = new EventEmitter<void>();
}
