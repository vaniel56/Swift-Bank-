// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from './environment';

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  message: string;
}

/** Shape of the response returned by POST /api/auth/login. */
export interface LoginResponse {
  message: string;
  token: string;
  /** Token lifetime in seconds. */
  expiresIn: number;
  /** Absolute expiry (UTC ISO timestamp). */
  expiresAt?: string;
  userId?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface UserProfile {
  userId: number | null;
  email: string;
  firstName?: string;
  lastName?: string;
}

/** Decoded JWT payload (the claims we care about). */
export interface JwtPayload {
  sub?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  jti?: string;
  iat?: number;
  exp?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/api/auth`;

  // localStorage keys used to keep the session across page reloads
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';

  // Reactive auth state so components can react to login/logout.
  private readonly authState$ = new BehaviorSubject<boolean>(this.hasStoredSession());

  constructor(private readonly http: HttpClient) {}

  /** Emits true/false whenever the user logs in or out. */
  get authState(): Observable<boolean> {
    return this.authState$.asObservable();
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload);
  }

  /** Calls POST /api/auth/login. Errors surface to the subscriber. */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password });
  }

  /** Persists the session returned by the backend on successful login. */
  saveSession(response: LoginResponse): void {
    localStorage.setItem(this.tokenKey, response.token);

    const profile: UserProfile = {
      userId: response.userId ?? this.getUserIdFromToken(response.token),
      email: response.email ?? this.getEmailFromToken(response.token) ?? '',
      firstName: response.firstName,
      lastName: response.lastName,
    };
    localStorage.setItem(this.userKey, JSON.stringify(profile));
    this.authState$.next(true);
  }

  /** Reads the saved JWT from localStorage. */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /** Reads the user profile persisted during login. */
  getUserProfile(): UserProfile | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserProfile;
    } catch {
      return null;
    }
  }

  /** Decodes a JWT payload without verifying the signature. */
  decodeToken(token: string): JwtPayload | null {
    try {
      return jwtDecode<JwtPayload>(token);
    } catch {
      return null;
    }
  }

  /** Unix-seconds expiry of the token, or null when unknown. */
  getTokenExpiry(token: string | null = this.getToken()): number | null {
    return token ? (this.decodeToken(token)?.exp ?? null) : null;
  }

  isTokenExpired(token: string | null = this.getToken()): boolean {
    const exp = this.getTokenExpiry(token);
    return exp != null && exp * 1000 <= Date.now();
  }

  /**
   * Whether the user is currently logged in with a valid, non-expired token.
   * Used by the AuthGuard to protect the layout routes.
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  /** True when a stored session exists, regardless of expiry. */
  hasStoredSession(): boolean {
    return !!this.getToken();
  }

  /**
   * Clears the stored token and user profile (logout).
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.authState$.next(false);
  }

  getUserIdFromToken(token: string): number | null {
    const sub = this.decodeToken(token)?.sub;
    if (!sub) return null;
    const id = Number(sub);
    return Number.isFinite(id) ? id : null;
  }

  getEmailFromToken(token: string): string | null {
    return this.decodeToken(token)?.email ?? null;
  }
}
