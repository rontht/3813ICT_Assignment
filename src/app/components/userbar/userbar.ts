import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface Member {
  id: string;
  username: string;
  roles: string[];
}

@Component({
  selector: 'app-userbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './userbar.html',
  styleUrl: './userbar.css',
})
export class Userbar {
  @Input() current_group_members: any[] = [];
  track_by_member_id = (_: number, m: Member) => m.id;
}
