import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Groups } from '../../../models/groups';
import { CommonModule } from '@angular/common';
import { Group } from '../../../models/group';
import { GroupService } from '../../../services/group.service';
import { User } from '../../../models/user';

@Component({
  selector: 'app-group-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './group-search.html',
  styleUrl: './group-search.css'
})
export class GroupSearch {
  private groupService = inject(GroupService);
  @Input() all_groups: Groups[] = [];
  @Input() user: User | null = null;
  @Output() openGroup = new EventEmitter<Group>();

  sendRequest(id: string) {
    this.groupService.sendRequest(id).subscribe({
      next: (res) => {
        const g = this.all_groups.find(gr => gr.id === id);
        if (g) {
          if (!Array.isArray(g.requests)) g.requests = [];
          if (!g.requests.includes(res)) {
            g.requests.push(res);
          }
        }
      },
      error: (e) => { }
    });
  }
}
