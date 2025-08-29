import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Home } from './components/home/home';

export const routes: Routes = [
  {
    path: '',
    component: Login,
    title: 'Cloud Connect: Login',
  },
  {
    path: 'home',
    component: Home,
    title: 'Cloud Connect: Home',
  },
];
