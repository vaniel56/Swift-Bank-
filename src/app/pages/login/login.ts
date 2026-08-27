/*
  Login component.
  - Simple form with client-side credential check (demo only).
  - NOTE: real apps should not store credentials in code and must use secure auth.
*/
import { Component, inject } from '@angular/core';
import { Router } from "@angular/router";
import { FormGroup, FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  showPassword: boolean = false;
  router = inject(Router);
  
  empForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  onLoginUser() {
    if (this.empForm.valid) {
      const { email, password } = this.empForm.value;
      if (email === 'olamide@gmail.com' && password === 'password123') {
        this.router.navigateByUrl("layout");
      } else {
        alert("Invalid Credentials");
      }
    } 
  }
}