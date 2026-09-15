import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Mock, vi } from 'vitest';

import { AuthService } from '../../auth.service';
import { Register } from './register';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let registerMock: Mock;

  beforeEach(async () => {
    registerMock = vi.fn().mockReturnValue(of({ message: 'Registration successful.' }));

    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [{ provide: AuthService, useValue: { register: registerMock } }],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  const fillValidForm = () => {
    component.firstName = 'Dave';
    component.lastName = 'Test';
    component.email = 'dave@example.com';
    component.password = 'secret123';
    component.confirmPassword = 'secret123';
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('validation', () => {
    it('blocks submit and flags every required field when the form is empty', () => {
      component.onSubmit();

      expect(registerMock).not.toHaveBeenCalled();
      expect(component.fieldErrors['firstName']).toBe('First name is required.');
      expect(component.fieldErrors['lastName']).toBe('Last name is required.');
      expect(component.fieldErrors['email']).toBe('Email is required.');
      expect(component.fieldErrors['password']).toBe('Password is required.');
      expect(component.fieldErrors['confirmPassword']).toBe('Please confirm your password.');
      expect(component.registrationPage).toBe('form');
    });

    it('rejects an invalid email address', () => {
      fillValidForm();
      component.email = 'not-an-email';

      component.onSubmit();

      expect(component.fieldErrors['email']).toBe('Enter a valid email address.');
      expect(registerMock).not.toHaveBeenCalled();
    });

    it('rejects a password shorter than 6 characters', () => {
      fillValidForm();
      component.password = '123';
      component.confirmPassword = '123';

      component.onSubmit();

      expect(component.fieldErrors['password']).toBe('Password must be at least 6 characters.');
      expect(registerMock).not.toHaveBeenCalled();
    });

    it('rejects mismatched passwords', () => {
      fillValidForm();
      component.confirmPassword = 'secret456';

      component.onSubmit();

      expect(component.fieldErrors['confirmPassword']).toBe('Passwords do not match.');
      expect(registerMock).not.toHaveBeenCalled();
    });
  });

  describe('submit', () => {
    it('calls register with the form values and shows the success page', () => {
      fillValidForm();

      component.onSubmit();

      expect(registerMock).toHaveBeenCalledWith({
        firstName: 'Dave',
        lastName: 'Test',
        email: 'dave@example.com',
        password: 'secret123',
        confirmPassword: 'secret123',
      });
      expect(component.loading).toBe(false);
      expect(component.registrationPage).toBe('success');
      expect(component.successData).toEqual({
        firstName: 'Dave',
        lastName: 'Test',
        email: 'dave@example.com',
      });
    });

    it('surfaces the server message when registration fails', () => {
      registerMock.mockReturnValueOnce(
        throwError(() => ({ error: { message: 'A user with this email already exists.' } })),
      );
      fillValidForm();

      component.onSubmit();

      expect(component.errorMessage).toBe('A user with this email already exists.');
      expect(component.registrationPage).toBe('form');
      expect(component.loading).toBe(false);
    });

    it('maps server-side field errors back onto the form', () => {
      // The client-side form is valid here; the server rejects fields the
      // client cannot validate (e.g. duplicate email).
      registerMock.mockReturnValueOnce(
        throwError(() => ({
          error: {
            errors: {
              Email: ['A user with this email already exists.'],
              Password: ['Password is too weak.'],
            },
          },
        })),
      );
      fillValidForm();

      component.onSubmit();

      expect(component.fieldErrors['email']).toBe('A user with this email already exists.');
      expect(component.fieldErrors['password']).toBe('Password is too weak.');
      expect(component.errorMessage).toBe('Please fix the errors below.');
      expect(component.loading).toBe(false);
    });

    it('shows a fallback message for unexpected errors', () => {
      registerMock.mockReturnValueOnce(throwError(() => new Error('network down')));
      fillValidForm();

      component.onSubmit();

      expect(component.errorMessage).toBe('Registration failed. Please try again.');
    });
  });
});
