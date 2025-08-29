import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface Group { id: string; name: string }
export interface User  { username: string; roles: string[] }

@Component({
  selector: 'app-groupbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './groupbar.html',
  styleUrl: './groupbar.css'
})
export class Groupbar {
  @Input() user!: User;
  @Input() groups: Group[] = [];
  @Input() current_group_id: string | null = null;

  @Output() openGroup = new EventEmitter<string>();
  @Output() openCreate = new EventEmitter<void>();
  @Output() onLogout = new EventEmitter<void>();

  trackByGroupId = (_: number, g: Group) => g.id;
}
