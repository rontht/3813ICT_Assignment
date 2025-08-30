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

  @Output() openGroup = new EventEmitter<Group>();
  @Output() openCreate = new EventEmitter<void>();
  @Output() onLogout = new EventEmitter<void>();

  track_by_group_id = (_: number, g: Group) => g.id;
}
