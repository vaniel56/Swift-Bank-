/*
  Login component.
  - Authenticates against the SwiftBank API (POST /api/auth/login).
  - Stores the returned JWT + user profile, then redirects to the dashboard
    (or back to the page the user originally tried to visit).
*/
import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../auth.service';
import { RegistrationSnackbarComponent } from '../registration-snackbar.component';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  showPassword = false;
  loading = false;
  errorMessage = '';

  emailControl = new FormControl('', [Validators.required, Validators.email]);
  passwordControl = new FormControl('', [Validators.required, Validators.minLength(6)]);

  empForm: FormGroup = new FormGroup({
    email: this.emailControl,
    password: this.passwordControl,
  });

  private readonly returnUrl: string;
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  constructor() {
    // Where to go after a successful login. Defaults to the dashboard.
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/layout/home';
  }

  goToRegister(): void {
    this.router.navigateByUrl('/register');
  }

  /**
   * Opens a styled snackbar (green for success, red for error).
   * Reuses the same component as the register page for a consistent look.
   */
  openSnackBar(message: string, type: 'success' | 'error' = 'success'): void {
    this.snackBar.openFromComponent(RegistrationSnackbarComponent, {
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

  onLoginUser(): void {
    if (this.empForm.invalid || this.loading) {
      this.empForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const email = this.emailControl.value ?? '';
    const password = this.passwordControl.value ?? '';

    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.loading = false;
        this.authService.saveSession(response);
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = this.getErrorMessage(error);
        this.openSnackBar(this.errorMessage, 'error');
      },
    });
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const serverMessage = (error.error as { message?: string } | null)?.message;

      if (error.status === 401) {
        return serverMessage || 'Invalid email or password.';
      }
      if (error.status === 0) {
        return 'Unsuccessful. Please try again.';
      }
      return serverMessage || 'Unsuccessful. Please try again.';
    }
    return 'Unsuccessful. Please try again.';
  }
}