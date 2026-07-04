import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { RegistryApiService } from '../../core/services/registry-api.service';
import { BannerComponent } from '../../shared/banner/banner.component';

@Component({
  selector: 'app-login',
  imports: [FormsModule, BannerComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly registryApi = inject(RegistryApiService);
  private readonly router = inject(Router);

  username = '';
  password = '';
  submitting = signal(false);
  error = signal<string | null>(null);

  submit(): void {
    if (!this.username || !this.password) return;

    this.submitting.set(true);
    this.error.set(null);
    this.authService.login(this.username, this.password);

    this.registryApi.ping().subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/repositories']);
      },
      error: () => {
        this.authService.logout();
        this.submitting.set(false);
        this.error.set('Could not connect — check your username and password.');
      }
    });
  }
}
