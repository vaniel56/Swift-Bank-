import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { vi } from 'vitest';

import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let httpMock: HttpTestingController;
  let snackBar: MatSnackBar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    snackBar = TestBed.inject(MatSnackBar);
    await fixture.whenStable();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('opens an error snackbar with "Invalid email or password." when the user does not exist (401)', () => {
    const openSpy = vi.spyOn(snackBar, 'openFromComponent').mockReturnValue(null as never);

    component.emailControl.setValue('nobody@example.com');
    component.passwordControl.setValue('wrong-password');
    component.onLoginUser();

    httpMock
      .expectOne((req) => req.url.endsWith('/api/auth/login'))
      .flush({ message: 'Invalid email or password.' }, { status: 401, statusText: 'Unauthorized' });

    expect(openSpy).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ data: { message: 'Invalid email or password.', type: 'error' } }),
    );
  });

  it('opens an error snackbar with an "unsuccessful" message when the login attempt fails', () => {
    const openSpy = vi.spyOn(snackBar, 'openFromComponent').mockReturnValue(null as never);

    component.emailControl.setValue('me@example.com');
    component.passwordControl.setValue('secret123');
    component.onLoginUser();

    httpMock
      .expectOne((req) => req.url.endsWith('/api/auth/login'))
      .flush({}, { status: 500, statusText: 'Server Error' });

    expect(openSpy).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ data: { message: 'Unsuccessful. Please try again.', type: 'error' } }),
    );
  });
});
