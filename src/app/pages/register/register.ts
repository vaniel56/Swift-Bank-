import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
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

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    this.loading = true;

    const body = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      confirmPassword: this.confirmPassword
    };
            // API
    this.http.post('http://localhost:5271/api/auth/register', body)
      .subscribe({
        next: () => {
          this.loading = false;
          alert('Registration successful!');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.loading = false;
          alert('Registration failed: ' + (err.error?.message || err.message));
        }
      });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}