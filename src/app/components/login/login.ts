import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { Router } from '@angular/router';
import { User } from '../../models/user';
import { Notification } from '../notification/notification';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, Notification],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private httpService = inject(HttpService);

  @ViewChild('noti') noti!: Notification;
  constructor(private router: Router) { };

  user: User | null = null;
  username = "";
  name = "";
  email = "";
  password = "";
  toggle: boolean = false;

  onLogin() {
    // connect to service
    this.httpService.login(this.username, this.password).subscribe({
      next: (data) => {

        // if wrong input
        if ('valid' in data && !data.valid) {
          this.noti.showError("Invalid Credentials! Please re-enter a valid username and password.");
          return;
        }
        this.user = data as User;

        // store info in local storage
        localStorage.setItem("username", this.user.username);
        this.router.navigate(['/dashboard']);
      },
      error: (e) => {
        this.noti.showError("Error while logging in. Try again later.");
      }
    })
  }

  onSignup() {
    // connect to service
    this.httpService.register(this.username, this.name, this.email, this.password, "user").subscribe({
      next: (data) => {
        // if wrong input
        if ('valid' in data && !data.valid) {
          this.noti.showError("Invalid username or email! Please enter a new one.");
          return;
        }
        this.user = data as User;

        this.noti.showConfirm(`Account for ${this.user.username} has been created. Please login using the credentials.`, 10000);
        localStorage.setItem("username", this.user.username);
        this.router.navigate(['/dashboard']);
      },
      error: (e) => {
        this.noti.showError(`Error while Signing up. Reason: ${e.error.error}.`);
      }
    })
  }

  toggleForms() {
    this.toggle = !this.toggle;
  }
}
