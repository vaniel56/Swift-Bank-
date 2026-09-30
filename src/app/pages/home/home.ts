// home.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { NgClass, CurrencyPipe, DecimalPipe, CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DashboardService, AccountDto, TransactionDto } from '../../dashboard.service';

/**
 * Home dashboard component.
 * Now backed by the real API:
 *   GET /api/dashboard  -> { accounts, totalBalance, currency, recentTransactions }
 * Balances come from the user's Savings/Current accounts.
 * Transactions come from recentTransactions (already sorted newest-first by the API).
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  imports: [NgClass, CurrencyPipe, DecimalPipe, CommonModule, RouterLink],
})
export class Home implements OnInit {
  private readonly router = inject(Router);
  private readonly dashboardService = inject(DashboardService);

  // Reactive account balances
  savings = signal(0);
  current = signal(0);
  totalBalance = signal(0);
  currency = signal('NGN');

  // UI state
  showBalance = true;
  displayTransactions: any[] = [];
  transactions: any[] = [];
  isRefreshing = false;
  isLoading = false;
  isActive = 'home';

  // Savings goal (kept as frontend-only for now — no backend endpoint yet)
  savedAmount = 310000;
  targetAmount = 500000;

  ngOnInit(): void {
    // Fallback: if user previously saved a custom savings goal, keep it.
    const saved = localStorage.getItem('savedAmount');
    if (saved) {
      this.savedAmount = Number(saved);
    }

    this.loadDashboard();
  }

  /** Pulls everything the home page needs from the API. */
  loadDashboard(): void {
    this.isLoading = true;

    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        this.applyDashboard(data);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load dashboard:', err);
        this.isLoading = false;
        // Interceptor handles 401 → redirects to /login.
        // Other errors: leave UI in a clean empty state.
        this.savings.set(0);
        this.current.set(0);
        this.totalBalance.set(0);
        this.displayTransactions = [];
        this.transactions = [];
      },
    });
  }

  /** Maps the API response onto the component's existing bindings. */
  private applyDashboard(data: {
    accounts: AccountDto[];
    totalBalance: number;
    currency: string;
    recentTransactions: TransactionDto[];
  }): void {
    // Split accounts by type — same logic the old localStorage version used.
    const savingsAcct = data.accounts.find((a) => a.accountType?.toLowerCase() === 'savings');
    const currentAcct = data.accounts.find((a) => a.accountType?.toLowerCase() === 'current');

    this.savings.set(Number(savingsAcct?.balance ?? 0));
    this.current.set(Number(currentAcct?.balance ?? 0));
    this.totalBalance.set(Number(data.totalBalance ?? 0));
    this.currency.set(data.currency ?? 'NGN');

    // Map API transactions to the shape home.html already expects.
    // Old code used t.date and t.amount (with sign). API uses createdAt and amount.
    const mapped = (data.recentTransactions ?? []).map((t) => {
      const isDebit = t.type?.toLowerCase() === 'debit';
      // Preserve the old display convention:
      //   Debit (money out) -> shows as "-"
      //   Credit (money in) -> shows as "+"
      const displayAmount = isDebit ? -Math.abs(t.amount) : Math.abs(t.amount);

      return {
        id: t.id,
        accountId: t.accountId,
        type: t.type,
        description: t.description,
        amount: displayAmount,
        date: t.createdAt, // alias so old template bindings keep working
        sign: isDebit ? '-' : '+',
        color: isDebit ? 'text-[#F75D59]' : 'text-[#A6E146]',
      };
    });

    // API already returns newest-first, but be defensive.
    mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    this.transactions = mapped;
    this.displayTransactions = mapped.slice(0, 5);
  }

  /** Triggered by the "Refresh" button (if present in home.html). */
  refresh(): void {
    if (this.isRefreshing) return;
    this.isRefreshing = true;
    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        this.applyDashboard(data);
        this.isRefreshing = false;
      },
      error: () => {
        this.isRefreshing = false;
      },
    });
  }

  // ✅ Auto-calculated balance (kept for template compatibility)
  get balance(): number {
    return this.totalBalance() || this.savings() + this.current();
  }

  toggleBalance(): void {
    this.showBalance = !this.showBalance;
  }

  goToTransfer(): void {
    this.router.navigate(['layout/transfer']);
  }

  goToPaybills(): void {
    this.router.navigate(['layout/paybills']);
  }

  goToSavings(): void {
    this.router.navigate(['layout/savings']);
  }

  goToHistory(): void {
    this.router.navigate(['layout/history']);
  }

  filteredTransactions(): any[] {
    return this.transactions.filter((t) => Math.abs(t.amount) >= 5);
  }

  get progress(): number {
    const saved = Number(this.savedAmount);
    const target = Number(this.targetAmount);

    // Guard against zero, negative, or non-finite targets. Without this,
    // a zero/negative target would divide by zero (→ Infinity/NaN), and a NaN
    // target would slip past `<= 0` because every NaN comparison is false.
    if (!Number.isFinite(target) || target <= 0) return 0;

    // Clamp between 0% and 100% so the progress bar is always valid.
    // A non-finite saved amount (e.g. a corrupted localStorage value) → 0%.
    const pct = (saved / target) * 100;
    return Number.isFinite(pct) ? Math.min(Math.max(pct, 0), 100) : 0;
  }
}
