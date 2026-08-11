import { Component } from '@angular/core';
import { NgClass, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { signal } from '@angular/core';

@Component({
  selector: 'app-paybills',
  imports: [NgClass, DecimalPipe],
  templateUrl: './paybills.html',
  styleUrl: './paybills.css',
})
export class Paybills {
  paybillpage: string = 'paybilldetails-page';
  insufficientFunds: boolean = false;
  activeService = 'ikeja';
  current = signal(0);



  constructor(private router: Router) {}

  selectService(service: string) {
    this.activeService = service;
  }
  goToHome() {
    this.router.navigate(['layout/home']);
  }
  goToSuccesful() {
    this.paybillpage = 'succesful-page';
  }
}

