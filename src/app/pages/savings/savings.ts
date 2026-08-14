import { Component, signal, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-savings',
  imports: [DecimalPipe, FormsModule],
  templateUrl: './savings.html',
  styleUrls: ['./savings.css'],
})
export class Savings implements OnInit {
  savingspage: string = 'savingsdetails-page';
  savings = signal(0);
  savingsAmount!: string;
  amount = Number(this.savingsAmount);
  insufficientFunds = false

  constructor(private router: Router) {}
  
  // `router` is now injected via the constructor

  ngOnInit() {
    const savedSavings = localStorage.getItem('savings');
    if (savedSavings) {
      this.savings.set(Number(savedSavings));
    }
  }
  goToSucceful() {
    const amount = Number(this.savingsAmount); // Convert string to number
    const currentBalance = Number(this.savings()); // Get the current balance
    if (!this.savingsAmount || Number(this.savingsAmount) <= 0) {
      alert('Enter valid amount');
      return;
    }
    this.savings.set(this.savings() - amount);
    // persist updated balance
    localStorage.setItem('savings', this.savings().toString());
    this.saveTransaction();

    this.savingspage = 'success-page';
  }

  goToHome() {
    this.router.navigate(['layout/home']);
  }
  saveTransaction() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');

    transactions.push({
      beneficiary: 'Added to new laptop fund',
      amount: Number(this.savingsAmount),
      date: new Date().toISOString(),
      type: 'savings',
    });

    localStorage.setItem('transactions', JSON.stringify(transactions));

    console.log('Transaction saved:', transactions);
  }
  checkBalance() {
    const amount = Number(this.savingsAmount);

    if (amount > Number(this.savings()) && amount > 0) {
      this.insufficientFunds = true;
    } else {
      this.insufficientFunds = false;
    }
  }
}