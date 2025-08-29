import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { Router } from '@angular/router';
import { User } from '../../models/user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private httpService = inject(HttpService);
  constructor(private router: Router) {};

  user: User | null = null;
  email = "";
  password = "";
  loginError: string | null = null;

  onLogin() {
    // reset the error message
    this.loginError = null;

    // connect to service
    this.httpService.login(this.email, this.password).subscribe({
      next: (data) => {

        // if wrong input
        if ('valid' in data && !data.valid) {
          this.loginError = "Invalid Credentials!";
          return;
        }
        this.user = data as User;

        // store info in local storage
        localStorage.setItem("user", JSON.stringify(this.user));
        this.router.navigate(['/home']);
      },
      error: (e) => {
        this.loginError = "Something went wrong. Please try again later.";
      },
      complete: () => {
        console.log("Login request complete!");
      }
    })
  }
}
