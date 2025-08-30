import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Member } from '../../../models/member';

@Component({
  selector: 'app-memberbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './memberbar.html',
  styleUrl: './memberbar.css'
})
export class Memberbar {
  @Input() current_group_members: any[] = [];
  track_by_member_id = (_: number, m: Member) => m.id;
}
