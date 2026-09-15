import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';

  showPassword = false;
  showConfirmPassword = false;
  loading = false;

  errorMessage = '';
  fieldErrors: { [key: string]: string } = {};
  
  registrationPage: string = 'form'; // 'form' or 'success'
  successData: any = null;
  countdownSeconds: number = 3;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  private validate(): boolean {
    this.fieldErrors = {};
    this.errorMessage = '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!this.firstName.trim()) this.fieldErrors['firstName'] = 'First name is required.';
    if (!this.lastName.trim()) this.fieldErrors['lastName'] = 'Last name is required.';

    if (!this.email.trim()) {
      this.fieldErrors['email'] = 'Email is required.';
    } else if (!emailRegex.test(this.email)) {
      this.fieldErrors['email'] = 'Enter a valid email address.';
    }

    if (!this.password) {
      this.fieldErrors['password'] = 'Password is required.';
    } else if (this.password.length < 6) {
      this.fieldErrors['password'] = 'Password must be at least 6 characters.';
    }

    if (!this.confirmPassword) {
      this.fieldErrors['confirmPassword'] = 'Please confirm your password.';
    } else if (this.password !== this.confirmPassword) {
      this.fieldErrors['confirmPassword'] = 'Passwords do not match.';
    }

    return Object.keys(this.fieldErrors).length === 0;
  }

  onSubmit() {
    if (!this.validate()) {
      this.loading = false;
      return;
    }

    this.loading = true;

    this.authService
      .register({
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        password: this.password,
        confirmPassword: this.confirmPassword,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.successData = {
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
          };
          this.registrationPage = 'success';
          this.countdownSeconds = 3;
          
          // Start countdown and auto-redirect to login after 3 seconds
          const countdownInterval = setInterval(() => {
            this.countdownSeconds--;
            if (this.countdownSeconds <= 0) {
              clearInterval(countdownInterval);
              this.goToLogin();
            }
          }, 1000);
        },
        error: (err) => {
          this.loading = false;
          const payload = err?.error;

          if (payload?.errors && typeof payload.errors === 'object') {
            for (const key of Object.keys(payload.errors)) {
              const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
              this.fieldErrors[camelKey] = payload.errors[key][0];
            }
            this.errorMessage = 'Please fix the errors below.';
          } else if (typeof payload === 'string') {
            this.errorMessage = payload;
          } else if (payload?.message) {
            this.errorMessage = payload.message;
          } else {
            this.errorMessage = 'Registration failed. Please try again.';
          }
        },
      });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
