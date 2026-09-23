import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Home } from './pages/home/home';
import { Layout } from './layout/layout';
import { Transfer } from './pages/transfer/transfer';
import { Paybills } from './pages/paybills/paybills';
import { Savings } from './pages/savings/savings';
import { History } from './pages/history/history';
import { Register } from './pages/register/register';
import { authGuard, guestGuard } from './auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  // Convenience alias so '/home' works like '/layout/home'
  { path: 'home', redirectTo: 'layout/home', pathMatch: 'full' },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'register', component: Register, canActivate: [guestGuard] },
  {
    path: 'layout',
    component: Layout,
    canActivate: [authGuard], // protects all children
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: Home },
      { path: 'transfer', component: Transfer },
      { path: 'paybills', component: Paybills },
      { path: 'savings', component: Savings },
      { path: 'history', component: History },
    ],
  },
  // Unknown routes → back to login
  { path: '**', redirectTo: 'login' },
];
