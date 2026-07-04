import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

import { RegistryApiService } from '../../core/services/registry-api.service';
import { Repository } from '../../core/models/repository.model';
import { BannerComponent } from '../../shared/banner/banner.component';

const PAGE_SIZE = 50;

@Component({
  selector: 'app-repositories',
  imports: [FormsModule, RouterLink, BannerComponent, MatIcon],
  templateUrl: './repositories.component.html',
  styleUrl: './repositories.component.scss'
})
export class RepositoriesComponent implements OnInit {
  private readonly registryApi = inject(RegistryApiService);

  repositories = signal<Repository[]>([]);
  nextCursor = signal<string | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  filterTerm = signal('');

  filteredRepositories = computed(() => {
    const term = this.filterTerm().trim().toLowerCase();
    if (!term) return this.repositories();
    return this.repositories().filter((repo) => repo.name.toLowerCase().includes(term));
  });

  ngOnInit(): void {
    this.loadPage();
  }

  loadMore(): void {
    this.loadPage(this.nextCursor() ?? undefined);
  }

  private loadPage(last?: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.registryApi.listRepositories(PAGE_SIZE, last).subscribe({
      next: (result) => {
        this.repositories.update((existing) => [...existing, ...result.items]);
        this.nextCursor.set(result.next);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load repositories.');
        this.loading.set(false);
      }
    });
  }
}
