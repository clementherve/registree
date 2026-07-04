import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'registree.auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _isAuthenticated = signal<boolean>(this.readStoredHeader() !== null);
  readonly isAuthenticated = this._isAuthenticated.asReadonly();

  login(username: string, password: string): string {
    const header = 'Basic ' + btoa(`${username}:${password}`);
    sessionStorage.setItem(STORAGE_KEY, header);
    this._isAuthenticated.set(true);
    return header;
  }

  logout(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    this._isAuthenticated.set(false);
  }

  getAuthHeader(): string | null {
    return this.readStoredHeader();
  }

  private readStoredHeader(): string | null {
    return sessionStorage.getItem(STORAGE_KEY);
  }
}
