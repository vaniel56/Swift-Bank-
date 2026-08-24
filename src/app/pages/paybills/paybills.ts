import { Component } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { disabled } from '@angular/forms/signals';

@Component({
  selector: 'app-paybills',
  imports: [DecimalPipe, NgClass, FormsModule],
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
  label: string = 'meter';
  meterData: any = null;
  selectedServiceData: { service: string; label: string; placeholder: string } = {
    service: 'Ikeja Electric',
    label: 'meter',
    placeholder: '12345678988',
  };
  selectedServiceIndex: number | null = null;
  activeService = 'Ikeja Electric';
  service = [
    { service: 'Ikeja Electric', label: 'meter', placeholder: '12345678988' },
    { service: 'DSTV', label: 'Device ID', placeholder: '123456789888484' },
    { service: 'MTN Airtime', label: 'Phone.NO', placeholder: '0901234567' },
  ];
  constructor(private router: Router) {}

  selectService(service: string) {
    this.activeService = service;
    this.selectedServiceData = this.service.find((item) => item.service === service) ?? {
      service: 'Ikeja Electric',
      label: 'meter',
      placeholder: '12345678988',
    };
    this.label = this.selectedServiceData.label;
    this.placeholder = this.selectedServiceData.placeholder;
  }
  placeholder: string = this.selectedServiceData.placeholder;

  goToHome() {
    this.router.navigate(['layout/home']);
  }
  goToSuccesful() {
    const cleanAmount = this.meterAmount.replace(/[₦]/g, '');
    const amount = Number(cleanAmount);

    if (!this.meterNumber || Number(this.meterNumber) <= 9) {
      this.invalidMeterNumber = true;
      return;
    } else {
      this.invalidMeterNumber = false;
    }

    if (!amount || Number(amount) <= 0) {
      this.invalidMeterAmount = true;
      return;
    } else {
      this.invalidMeterAmount = false;
    }

    if (amount > this.current()) {
      this.insufficientFunds = true;
      return;
    }
    if (this.selectedServiceData?.service == null) {
      alert('Select a biller');
    } else {
      this.paybillpage = 'succesful-page';
    }

    this.insufficientFunds = false;

    const newBalance = this.current() - amount;

    this.current.set(newBalance);
    localStorage.setItem('current', newBalance.toString());

    this.meterData = {
      service: this.selectedServiceData,
      meterAmount: this.meterAmount,
    };
    this.saveTransaction();
  }


  saveTransaction() {
    const cleanAmount = this.meterAmount.replace(/[₦]/g, '');
    const amount = Number(cleanAmount);
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.push({
      beneficiary: this.selectedServiceData?.service || 'Unknown',
      amount: amount,
      date: new Date().toLocaleString(),
      type: 'bills',
    });
    localStorage.setItem('transactions', JSON.stringify(transactions));
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
    const cleanAmount = this.meterAmount.replace(/[₦]/g, '');
    const amount = Number(cleanAmount);

    // Show ₦ and commas
    if (amount > 0) {
      this.meterAmount = '₦' + amount.toLocaleString('en-NG');
    }

    if (amount > Number(this.current()) && amount > 0) {
      this.insufficientFunds = true;
    } else {
      this.insufficientFunds = false;
    }
  }
}
