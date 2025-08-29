import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';

export const routes: Routes = [
  {
    path: '',
    component: Login,
    title: 'Cloud Connect: Login',
  },
  {
    path: 'dashboard',
    component: Dashboard,
    title: 'Cloud Connect: Dashboard',
  },
];
