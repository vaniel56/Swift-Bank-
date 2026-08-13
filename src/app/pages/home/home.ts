import { Component, inject, OnInit, signal } from '@angular/core';
import { NgClass, CurrencyPipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css',
  imports: [NgClass, CurrencyPipe, DecimalPipe, CommonModule, RouterLink],
})
export class Home implements OnInit {
  router = inject(Router);
  savings = signal(0);
  current = signal(0);

  showBalance: boolean = true;
  displayTransactions: any[] = [];
  isRefreshing: boolean = false;
  isLoading: boolean = false;
  transactions: any[] = [];

  ngOnInit() {
    //check if localStorage has values for savings and current,
    //  if not set them to default values
    // let savings = localStorage.getItem('savings');
    // let current = localStorage.getItem('current');
    // if (!savings) {
    //   localStorage.setItem('savings', '210000');
    //   this.savings.set(210000);
    // } else {
    //   this.savings.set(Number(savings));
    // }
    //

    {
      const saved = JSON.parse(localStorage.getItem('transactions') || '[]');

      this.displayTransactions = saved
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()) // latest first
        .slice(0, 5) // only 5
        .map((t: any) => ({
          ...t,
          sign: t.amount > 0 ? '-' : '+',
          color: t.amount > 0 ? 'text-[#F75D59]' : 'text-[#A6E146]',
        }));
    }
    //
    console.log(localStorage.getItem('savings'));

    if (localStorage.getItem('savings') === null) {
      localStorage.setItem('savings', '210000');
    } else {
      this.savings.set(Number(localStorage.getItem('savings')));
    }
    if (localStorage.getItem('current') === null) {
      localStorage.setItem('current', '272300');
    } else {
      this.current.set(Number(localStorage.getItem('current')));
    }

    this.transactions = JSON.parse(localStorage.getItem('transactions') || '[]');

    // store numbers (NO commas)
    // localStorage.setItem('savings', '210000');
    // localStorage.setItem('current', '272300');

    // // get and convert to number
    // this.savings.set(Number(localStorage.getItem('savings')));
    // this.current.set(Number(localStorage.getItem('current')));
  }

  // ✅ auto calculate balance
  get balance(): number {
    return this.savings() + this.current();
  }

  toggleBalance() {
    this.showBalance = !this.showBalance;
  }
  goToTransfer() {
    this.router.navigate(['layout/transfer']);
  }

  goToPaybills() {
    this.router.navigate(['layout/paybills']);
  }
  goToSavings() {
    this.router.navigate(['layout/savings']);
  }
  isActive = 'home';

  goToHistory() {
    this.router.navigate(['layout/history']);
    
  }

  filteredTransactions() {
    return this.transactions.filter((t) => t.amount >= 5);
  }
}


