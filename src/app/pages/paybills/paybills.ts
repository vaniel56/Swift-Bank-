import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { disabled } from '@angular/forms/signals';

@Component({
  selector: 'app-paybills',
  imports: [DecimalPipe, FormsModule],
  templateUrl: './paybills.html',
  styleUrl: './paybills.css',
})
export class Paybills {
  paybillpage: string = 'paybilldetails-page';
  insufficientFunds: boolean = false;
  invalidMeterNumber: boolean = false;
  invalidMeterAmount: boolean = false;
  current = signal(0);
  meterAmount!: string;
  meterNumber = '';
  meterData: any = null;
  selectedServiceData: any = null;
  selectedServiceIndex: number | null = null;
  activeService = 'DSTV';
  service = [{ service: 'Ikeja Electric' }, { service: 'DSTV' }, { service: 'MTN Airtime' }];
  constructor(private router: Router) {}

  selectService(service: string) {
    this.activeService = service;
    this.selectedServiceData = { service: service };
  }
  goToHome() {
    this.router.navigate(['layout/home']);
  }
  saveTransaction() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.push({
      beneficiary: this.selectedServiceData?.service || 'Unknown',
      amount: this.meterAmount,
      date: new Date().toLocaleString(),
      type: 'bills',
    });
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }
  goToSuccesful() {
    if(this.activeService ==''){
      disabled

    }
    if (!this.meterNumber || Number(this.meterNumber) <= 9) {
      this.invalidMeterNumber = true;
      return;
    } else {
      this.invalidMeterNumber = false;
    }

    if (!this.meterAmount || Number(this.meterAmount) <= 0) {
      this.invalidMeterAmount = true;
      return;
    } else {
      this.invalidMeterAmount = false;
    }

    const amount = Number(this.meterAmount);

    if (amount > this.current()) {
      this.insufficientFunds = true;
      return;
    }

    this.insufficientFunds = false;

    const newBalance = this.current() - amount;

    this.current.set(newBalance);
    localStorage.setItem('current', newBalance.toString());

    this.paybillpage = 'succesful-page';

    this.meterData = {
      service: this.selectedServiceData,
      meterAmount: this.meterAmount,
    };
    this.saveTransaction()
  }

  ngOnInit() {
    const savedCurrent = localStorage.getItem('current');

    if (savedCurrent === null || isNaN(Number(savedCurrent))) {
      localStorage.setItem('current', '272300');
      this.current.set(272300);
    } else {
      this.current.set(Number(savedCurrent));
    }
  }

  checkBalance() {
    const amount = Number(this.meterAmount);

    if (amount > Number(this.current()) && amount > 0) {
      this.insufficientFunds = true;
    } else {
      this.insufficientFunds = false;
    }
  }
}
