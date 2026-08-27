/*
  Savings component.
  - Manages adding funds to a savings goal and persisting changes to localStorage.
  - Be careful with `savingsAmount` initial value access; ensure it's set before use.
*/
import { Component, signal, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-savings',
  imports: [CommonModule, DecimalPipe, FormsModule],
  templateUrl: './savings.html',
  styleUrls: ['./savings.css'],
})
export class Savings implements OnInit {
  savingspage: string = 'savingsdetails-page';
  savings = signal(0);
  savingsAmount!: string;
  amount = Number(this.savingsAmount);
  insufficientFunds = false;

  constructor(private router: Router) {}

  // Savings goal
  savedAmount = 310000;
  targetAmount = 500000;

  ngOnInit() {
    // Get savings balance
    const savedSavings = localStorage.getItem('savings');

    if (savedSavings) {
      this.savings.set(Number(savedSavings));
    }

    // Get savings goal amount
    const savedGoal = localStorage.getItem('savedAmount');

    if (savedGoal) {
      this.savedAmount = Number(savedGoal);
    }
  }

  // Calculate progress percentage
  get progress(): number {
    return Math.min((this.savedAmount / this.targetAmount) * 100, 100);
  }

  goToSucceful() {
    // Remove ₦ and commas

    const cleaned = this.savingsAmount.replace(/[₦,]/g, '');
    const amount = Number(cleaned);

    if (!amount || amount <= 0) {
      alert('Enter valid amount');
      return;
    }

    if (amount > this.savings()) {
      this.insufficientFunds = true;
      return;
    }

    this.insufficientFunds = false;

    // Remove amount from savings
    this.savings.update((value) => value - amount);

    // Save updated savings
    localStorage.setItem('savings', this.savings().toString());

    // Add amount to savings goal
    this.savedAmount += amount;

    // Save updated goal
    localStorage.setItem('savedAmount', this.savedAmount.toString());

    // Save transaction
    this.saveTransaction();

    // Go to success page
    this.savingspage = 'success-page';
  }
  goToHome() {
    this.router.navigate(['layout/home']);
  }

  saveTransaction() {
    // Remove ₦ and commas
    const cleaned = this.savingsAmount.replace(/[₦,]/g, '');
    const amount = Number(cleaned);

    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');

    transactions.push({
      beneficiary: 'Added to new laptop fund',
      amount: amount, // Saves only the number
      date: new Date().toISOString(),
      type: 'savings',
    });

    localStorage.setItem('transactions', JSON.stringify(transactions));

    console.log('Transaction saved:', transactions);
  }
  checkBalance() {
    // Remove ₦ and commas before converting to number
    const raw = this.savingsAmount || '';
    const amount = Number(raw.replace(/[^0-9.]/g, ''));
    if (amount > 0) {
      this.savingsAmount = '₦' + amount.toLocaleString('en-NG');
    }
    // Check balance
    if (amount > this.savings() && amount > 0) {
      this.insufficientFunds = true;
    } else {
      this.insufficientFunds = false;
    }
  }
  
  allowNumbersOnly(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];

    if (!/[0-9]/.test(event.key) && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }
}
