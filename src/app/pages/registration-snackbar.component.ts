import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

export interface SnackbarData {
  message: string;
  type: 'success' | 'error';
}

@Component({
  selector: 'app-registration-snackbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex items-center gap-3 px-4 py-3 rounded-lg text-white shadow-lg"
      [ngClass]="{
        'bg-emerald-600': data.type === 'success',
        'bg-red-600': data.type === 'error',
      }"
    >
      <svg
        *ngIf="data.type === 'success'"
        class="w-6 h-6 shrink-0"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      <svg
        *ngIf="data.type === 'error'"
        class="w-6 h-6 shrink-0"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
        />
      </svg>

      <span class="text-sm font-medium">{{ data.message }}</span>
    </div>
  `,
})
export class RegistrationSnackbarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: SnackbarData) {}
}
