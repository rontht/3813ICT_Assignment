import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'noti',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrl: './notification.css'
})
export class Notification {

  @Input() width: number = 300;

  message: string = "";
  show_noti = false;
  noti_timer: any = null;
  noti_type: 'error' | 'warning' | 'confirm' = 'error';

  constructor() { }

  showError(message: string, time: number = 3000) {
    this.triggerNoti('error', message, time);
  }

  showWarning(message: string, time: number = 3000) {
    this.triggerNoti('warning', message, time);
  }

  showConfirm(message: string, time: number = 3000) {
    this.triggerNoti('confirm', message, time);
  }

  triggerNoti(type: 'error' | 'warning' | 'confirm', message: string, time: number) {
    // set type and message
    this.noti_type = type;
    this.message = message;
    // reset timer if exist
    if (this.noti_timer) {
      clearTimeout(this.noti_timer);
      this.noti_timer = null;
    }
    // show error popup
    this.show_noti = true;
    // auto-hide error after duration
    this.noti_timer = setTimeout(() => this.hideNoti(), time);
  }

  hideNoti() {
    // start hide animation
    this.show_noti = false;
    // clear timer
    if (this.noti_timer) {
      clearTimeout(this.noti_timer);
      this.noti_timer = null;
    }
  }

  ngOnDestroy(): void {
    if (this.noti_timer) {
      clearTimeout(this.noti_timer);
      this.noti_timer = null;
    }
  }
}
