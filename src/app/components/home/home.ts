import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  constructor(private router: Router) {}

  user: any = null;
  temp_data: any = {};

  ngOnInit() {
    const user_info = localStorage.getItem('user');
    if (!user_info) {
      this.router.navigate(['']);
      return;
    }
    this.user = JSON.parse(user_info);
    this.temp_data = { ...this.user };
  }
}
