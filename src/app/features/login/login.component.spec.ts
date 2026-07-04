import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';

import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    fixture = TestBed.createComponent(LoginComponent);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => httpMock.verify());

  it('navigates to /repositories on a successful ping', () => {
    const navigateSpy = spyOn(router, 'navigate');
    fixture.componentInstance.username = 'user';
    fixture.componentInstance.password = 'pass';

    fixture.componentInstance.submit();

    httpMock.expectOne(`${environment.apiBasePath}/`).flush({});

    expect(navigateSpy).toHaveBeenCalledWith(['/repositories']);
    expect(authService.isAuthenticated()).toBeTrue();
  });

  it('logs out and shows an error when the ping fails', () => {
    fixture.componentInstance.username = 'user';
    fixture.componentInstance.password = 'wrong';

    fixture.componentInstance.submit();

    httpMock.expectOne(`${environment.apiBasePath}/`).flush('unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(authService.isAuthenticated()).toBeFalse();
    expect(fixture.componentInstance.error()).toBeTruthy();
  });
});
