import { Component, Input } from '@angular/core';
import { Groups } from '../../../models/groups';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-group-search',
  standalone:  true,
  imports: [CommonModule],
  templateUrl: './group-search.html',
  styleUrl: './group-search.css'
})
export class GroupSearch {
  @Input() all_groups: Groups[] = [];
}
