import { Component, signal } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { DecimalPipe } from '@angular/common';
import { OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { ArgumentOutOfRangeError } from 'rxjs';

@Component({
  selector: 'app-transfer',
  imports: [NgClass, DecimalPipe, FormsModule, CommonModule], // Make sure DecimalPipe is here
  templateUrl: './transfer.html',
  styleUrl: './transfer.css',
})
export class Transfer {
  transferPage: string = 'beneficiary-page';
  // private transferDetails:string = "transfer-details";
  // private transferReview:string = "transfer-review";
  // private successPage:string = "success-page"
  selectedBeneficiary: number | null = null;

  selectedBeneficiaryData: any = null;
  goToHome() {
    this.router.navigate(['layout/home']);
  }
  goToBeneficiary() {
    this.transferPage = 'beneficiary-page';
  }
  beneficiaries = [
    { name: 'Chidi Okafor', bank: 'GTBank' },
    { name: 'Amaka Bello', bank: 'Access Bank' },
    { name: 'Tunde Alli', bank: 'Zenith Bank' },
  ];

  selectBeneficiary(index: number) {
    if (this.selectedBeneficiary === index) {
      this.selectedBeneficiary = null;
    } else {
      this.selectedBeneficiary = index;
    }
  }
  goTotransferDetails() {
    if (this.selectedBeneficiary !== null) {
      this.transferPage = 'transfer-details';
      // Store the beneficiary data to use on the transfer details page
      this.selectedBeneficiaryData = this.beneficiaries[this.selectedBeneficiary];
    } else {
      alert('Please select a beneficiary before proceeding.');
    }
  }
  router = inject(Router);
  savings = signal(0);
  current = signal(0);
  transferAmount!: string;
  transferData: any = null;
  insufficientFunds: boolean = false;
  ngOnInit() {
    // Get from localStorage or set defaults
    const savedCurrent = localStorage.getItem('current');
    const savedSavings = localStorage.getItem('savings');

    if (savedCurrent) {
      this.current.set(Number(savedCurrent));
    }

    if (savedSavings) {
      this.savings.set(Number(savedSavings));
    }

    console.log('Current balance loaded:', Number(this.current())); // Debug
  }
  note: string = '';

  goToTransferReview() {
    const amount = Number(this.transferAmount); // Convert string to number
    const currentBalance = Number(this.current()); // Get the current balance
    if (!this.transferAmount || Number(this.transferAmount) <= 0) {
      alert('Enter valid amount');
      return;
    }

    if (Number(this.transferAmount) > this.current()) {
      alert('Insufficient balance');
      return;
    }
    this.current.set(this.current() - Number(this.transferAmount));

    this.transferPage = 'transfer-review';
    this.transferData = {
      beneficiary: this.selectedBeneficiaryData,
      amount: this.transferAmount,
      note: this.note || '---',
    };
  }

  checkBalance() {
    const amount = Number(this.transferAmount);

    if (amount > Number(this.current()) && amount > 0) {
      this.insufficientFunds = true;
    } else {
      this.insufficientFunds = false;
    }
  }
  // Add this method to your Transfer class
  saveTransaction() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.push({
      beneficiary: this.selectedBeneficiaryData?.name || 'Unknown',
      amount: this.transferAmount,
      date: new Date().toLocaleString(),
      type: 'Transfer',
    });
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }

  confirmTransfer() {
    let transferAmounts = this.transferAmount;
    let currentBalance = this.current();
    console.log('transfer amount:', transferAmounts);
    console.log('Current balance before deduction:', currentBalance);

    localStorage.setItem('current', String(this.current()));
    console.log('Before deduction - Current:', this.current());
    console.log('Transfer amount:', this.transferAmount);

    const amount = Number(this.transferAmount);
    this.current.set(this.current() - amount);

    console.log('After deduction - Current:', this.current());

    localStorage.setItem('current', this.current().toString());
    console.log('Saved to localStorage:', localStorage.getItem('current'));
    this.saveTransaction();
    this.transferPage = 'success-page';
  }
  updateTransferHistory() {}

  resetTransfer() {
    this.transferPage = 'beneficiary-page';
    this.transferAmount = '';
    this.note = '';
    this.selectedBeneficiary = null;
    this.selectedBeneficiaryData = null;
    this.transferData = null;
    this.insufficientFunds = false;
  }
}
