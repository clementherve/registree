import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

import { RegistryApiService } from '../../core/services/registry-api.service';
import { Tag } from '../../core/models/tag.model';
import { BannerComponent } from '../../shared/banner/banner.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { CopyButtonComponent } from '../../shared/copy-button/copy-button.component';

const PAGE_SIZE = 50;

@Component({
  selector: 'app-repository-detail',
  imports: [RouterLink, BannerComponent, ConfirmDialogComponent, MatIcon, CopyButtonComponent],
  templateUrl: './repository-detail.component.html',
  styleUrl: './repository-detail.component.scss'
})
export class RepositoryDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly registryApi = inject(RegistryApiService);

  repositoryName = '';
  tags = signal<Tag[]>([]);
  nextCursor = signal<string | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  pendingDelete = signal<{ tagName: string; digest: string } | null>(null);
  deleting = signal(false);

  ngOnInit(): void {
    const rawName = this.route.snapshot.paramMap.get('name') ?? '';
    this.repositoryName = decodeURIComponent(rawName);
    this.loadPage();
  }

  loadMore(): void {
    this.loadPage(this.nextCursor() ?? undefined);
  }

  requestDelete(tagName: string): void {
    this.error.set(null);
    this.registryApi.getManifest(this.repositoryName, tagName).subscribe({
      next: (manifest) => {
        this.pendingDelete.set({ tagName, digest: manifest.digest });
      },
      error: () => {
        this.error.set(`Could not resolve the digest for tag "${tagName}".`);
      }
    });
  }

  confirmDelete(): void {
    const pending = this.pendingDelete();
    if (!pending) return;

    this.deleting.set(true);
    this.registryApi.deleteManifest(this.repositoryName, pending.digest).subscribe({
      next: () => {
        this.tags.update((existing) => existing.filter((tag) => tag.name !== pending.tagName));
        this.successMessage.set(`Tag "${pending.tagName}" deleted.`);
        this.pendingDelete.set(null);
        this.deleting.set(false);
      },
      error: () => {
        this.error.set(`Failed to delete tag "${pending.tagName}".`);
        this.pendingDelete.set(null);
        this.deleting.set(false);
      }
    });
  }

  cancelDelete(): void {
    this.pendingDelete.set(null);
  }

  private loadPage(last?: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.registryApi.listTags(this.repositoryName, PAGE_SIZE, last).subscribe({
      next: (result) => {
        this.tags.update((existing) => [...existing, ...result.items]);
        this.nextCursor.set(result.next);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load tags.');
        this.loading.set(false);
      }
    });
  }
}
