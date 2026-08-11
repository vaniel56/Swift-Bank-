import { Component } from '@angular/core';
import { NgClass, NgFor, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Layout } from '../../layout/layout';
import { Router } from '@angular/router';

@Component({
  selector: 'app-history',
  imports: [NgClass, NgFor, DecimalPipe, FormsModule],
  templateUrl: './history.html',
  styleUrl: './history.css',
})
export class History {
  searchTerm: string = '';
  displayTransactions: any[] = [];
  filter: string = 'all';


  setFilter(type: string) {
    this.filter = type;
  }
  filteredTransactions() {
    let result = this.displayTransactions;

    // Apply filter type first
    if (this.filter === 'in') {
      result = result.filter((transaction) => transaction.amount < 0); // money in
    } else if (this.filter === 'out') {
      result = result.filter((transaction) => transaction.amount > 0); // money out
    }

    // Apply search term filter
    if (this.searchTerm) {
      result = result.filter((transaction) =>
        transaction.beneficiary?.toLowerCase().includes(this.searchTerm.toLowerCase()),
      );
    }

    return result;
  }


  constructor(public router: Router) {}

  goToHome() {
    this.router.navigate(['layout/home']);
  }
}
