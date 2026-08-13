import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-transfer',
  imports: [NgClass, DecimalPipe, FormsModule, CommonModule], // keep pipes/modules used by template
  templateUrl: './transfer.html',
  styleUrls: ['./transfer.css'],
})
export class Transfer implements OnInit {
  // current visible page in the transfer flow
  transferPage: string = 'beneficiary-page';
  // private transferDetails:string = "transfer-details";
  // private transferReview:string = "transfer-review";
  // private successPage:string = "success-page"
  // index of the selected beneficiary (null = none)
  selectedBeneficiary: number | null = null;

  // stored data for the selected beneficiary (used on details/review)
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
  // Angular Router (injected)
  router = inject(Router);

  // reactive balances (signals)
  savings = signal(0);
  current = signal(0);

  // form fields
  transferAmount: string = '';
  transferData: any = null;
  insufficientFunds: boolean = false;
  // Initialize component and load persisted balances
  ngOnInit() {
    const savedCurrent = localStorage.getItem('current');
    const savedSavings = localStorage.getItem('savings');

    if (savedCurrent) {
      this.current.set(Number(savedCurrent));
    }

    if (savedSavings) {
      this.savings.set(Number(savedSavings));
    }
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
    // Do NOT mutate balances here; only prepare the review
    this.transferPage = 'transfer-review';
    this.transferData = {
      beneficiary: this.selectedBeneficiaryData,
      amount: this.transferAmount,
      note: this.note || '---',
    };
  }

  checkBalance() {
    const amount = Number(this.transferAmount);
    this.insufficientFunds = amount > this.current() && amount > 0;
  }
  // Add this method to your Transfer class
  saveTransaction() {
    // persist a simple transaction entry
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.push({
      beneficiary: this.selectedBeneficiaryData?.name || 'Unknown',
      amount: Number(this.transferAmount),
      date: new Date().toLocaleString(),
      type: 'Transfer',
    });
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }

  confirmTransfer() {
    // perform the final transfer: deduct balance, persist, and record transaction
    const amount = Number(this.transferAmount);
    this.current.set(this.current() - amount);
    // persist updated balance
    localStorage.setItem('current', this.current().toString());
    // save transaction for history
    this.saveTransaction();
    this.transferPage = 'success-page';
  }
  // resetTransfer clears the form and returns user to beneficiary selection

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
