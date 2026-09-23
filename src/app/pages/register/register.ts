import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RegistrationSnackbarComponent } from '../registration-snackbar.component';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
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
  successMessage = '';

  fieldErrors: { [key: string]: string } = {};

  private redirectTimer?: ReturnType<typeof setInterval>;

  countdownSeconds = 3;

  constructor(
    private router: Router,
    private authService: AuthService,
    private _snackBar: MatSnackBar
  ) {}

  /**
   * Opens a styled snackbar (green for success, red for error).
   */
  openSnackBar(message: string, type: 'success' | 'error' = 'success'): void {
    this._snackBar.openFromComponent(RegistrationSnackbarComponent, {
      duration: this.durationInSeconds() * 1000,
      data: { message, type },
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['custom-snackbar'],
    });
  }

  durationInSeconds(): number {
    return 3;
  }

  /**
   * Validates the form client-side.
   */
  private validate(): boolean {
    this.fieldErrors = {};
    this.errorMessage = '';
    this.successMessage = '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!this.firstName.trim()) {
      this.fieldErrors['firstName'] = 'First name is required.';
    }

    if (!this.lastName.trim()) {
      this.fieldErrors['lastName'] = 'Last name is required.';
    }

    if (!this.email.trim()) {
      this.fieldErrors['email'] = 'Email is required.';
    } else if (!emailRegex.test(this.email.trim())) {
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

  /**
   * Handles registration submit.
   */
  onSubmit(): void {
    if (!this.validate() || this.loading) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const body = {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim(),
      password: this.password,
      confirmPassword: this.confirmPassword,
    };

    this.authService.register(body).subscribe({
      /**
       * 200 OK — success.
       */
      next: (response) => {
        this.loading = false;
        this.errorMessage = '';
        this.fieldErrors = {};

        const successMsg =
          response?.message ||
          'Registration successful. You can now sign in.';

        // Show green success snackbar
        this.openSnackBar(successMsg, 'success');

        // Clear form
        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.password = '';
        this.confirmPassword = '';

        // Redirect after 3 seconds
        this.startRedirectCountdown();
      },

      /**
       * Error handler — 400 / 409 / others.
       */
      error: (err) => {
        this.loading = false;
        this.successMessage = '';
        this.fieldErrors = {};

        const status = err?.status;
        const payload = err?.error;

        // 409 Conflict — user already exists
        if (status === 409) {
          const message =
            payload?.message || 'A user with this email already exists.';

          this.errorMessage = message;
          this.fieldErrors = { ...this.fieldErrors, email: message };

          this.openSnackBar(message, 'error');
          return;
        }

        // 400 Bad Request — backend validation failed
        if (status === 400) {
          const message =
            payload?.message ||
            'Registration unsuccessful. Please check your details and try again.';

          if (payload?.errors && typeof payload.errors === 'object') {
            for (const key of Object.keys(payload.errors)) {
              const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
              const errorValue = payload.errors[key];

              if (Array.isArray(errorValue) && errorValue.length > 0) {
                this.fieldErrors[camelKey] = errorValue[0];
              } else if (typeof errorValue === 'string') {
                this.fieldErrors[camelKey] = errorValue;
              }
            }
          }

          this.errorMessage = message;
          this.openSnackBar(message, 'error');
          return;
        }

        // Anything else (network, CORS, 500, ...)
        const message =
          payload?.message || 'Registration unsuccessful. Please try again.';

        this.errorMessage = message;
        this.openSnackBar(message, 'error');
      },
    });
  }

  /**
   * Starts a countdown before redirecting to /login.
   */
  private startRedirectCountdown(seconds = 3): void {
    if (this.redirectTimer) {
      clearInterval(this.redirectTimer);
    }

    this.countdownSeconds = seconds;

    this.redirectTimer = setInterval(() => {
      this.countdownSeconds--;

      if (this.countdownSeconds <= 0) {
        if (this.redirectTimer) {
          clearInterval(this.redirectTimer);
        }
        this.router.navigate(['/login']);
      }
    }, 1000);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}