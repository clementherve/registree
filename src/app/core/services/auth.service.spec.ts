import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  afterEach(() => sessionStorage.clear());

  it('starts unauthenticated when no credentials are stored', () => {
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.getAuthHeader()).toBeNull();
  });

  it('stores a Basic auth header on login and marks as authenticated', () => {
    const header = service.login('user', 'pass');

    expect(header).toBe('Basic ' + btoa('user:pass'));
    expect(service.getAuthHeader()).toBe(header);
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('clears credentials on logout', () => {
    service.login('user', 'pass');
    service.logout();

    expect(service.getAuthHeader()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
  });
});
