// dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './environment';

export interface AccountDto {
  id: number;
  accountNumber: string;
  accountType: string; // "Savings" | "Current" | ...
  balance: number;
  currency: string; // "NGN"
}

export interface TransactionDto {
  id: number;
  accountId: number;
  type: string; // "Credit" | "Debit"
  description: string;
  amount: number;
  createdAt: string; // ISO date
}

export interface DashboardDto {
  accounts: AccountDto[];
  totalBalance: number;
  currency: string;
  recentTransactions: TransactionDto[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly apiUrl = `${environment.apiUrl}/api`;

  constructor(private readonly http: HttpClient) {}

  /** GET /api/dashboard — summary for the logged-in user. */
  getDashboard(): Observable<DashboardDto> {
    return this.http.get<DashboardDto>(`${this.apiUrl}/dashboard`);
  }

  /** GET /api/accounts — all accounts for the logged-in user. */
  getAccounts(): Observable<AccountDto[]> {
    return this.http.get<AccountDto[]>(`${this.apiUrl}/accounts`);
  }

  /** GET /api/accounts/{id} — one account (404 if it isn't yours). */
  getAccount(id: number): Observable<AccountDto> {
    return this.http.get<AccountDto>(`${this.apiUrl}/accounts/${id}`);
  }
}
