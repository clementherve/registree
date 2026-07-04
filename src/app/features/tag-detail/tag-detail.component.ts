import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

import { RegistryApiService } from '../../core/services/registry-api.service';
import { ManifestList, ManifestV2 } from '../../core/models/manifest.model';
import { ImageConfig } from '../../core/models/image-config.model';
import { BannerComponent } from '../../shared/banner/banner.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { ByteSizePipe } from '../../shared/pipes/byte-size.pipe';
import { CopyButtonComponent } from '../../shared/copy-button/copy-button.component';

@Component({
  selector: 'app-tag-detail',
  imports: [RouterLink, BannerComponent, ConfirmDialogComponent, ByteSizePipe, MatIcon, CopyButtonComponent],
  templateUrl: './tag-detail.component.html',
  styleUrl: './tag-detail.component.scss'
})
export class TagDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly registryApi = inject(RegistryApiService);

  repositoryName = '';
  tagName = '';

  manifest = signal<ManifestV2 | ManifestList | null>(null);
  imageConfig = signal<ImageConfig | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  confirmingDelete = signal(false);
  deleting = signal(false);

  totalSize = computed(() => {
    const manifest = this.manifest();
    if (!manifest || manifest.kind !== 'manifest') return null;
    return manifest.config.size + manifest.layers.reduce((sum, layer) => sum + layer.size, 0);
  });

  layerCount = computed(() => {
    const manifest = this.manifest();
    return manifest && manifest.kind === 'manifest' ? manifest.layers.length : 0;
  });

  ngOnInit(): void {
    this.repositoryName = decodeURIComponent(this.route.snapshot.paramMap.get('name') ?? '');
    this.tagName = decodeURIComponent(this.route.snapshot.paramMap.get('tag') ?? '');
    this.load();
  }

  requestDelete(): void {
    this.confirmingDelete.set(true);
  }

  cancelDelete(): void {
    this.confirmingDelete.set(false);
  }

  confirmDelete(): void {
    const manifest = this.manifest();
    if (!manifest) return;

    this.deleting.set(true);
    this.registryApi.deleteManifest(this.repositoryName, manifest.digest).subscribe({
      next: () => {
        this.router.navigate(['/repositories', this.repositoryName]);
      },
      error: () => {
        this.error.set('Failed to delete tag.');
        this.confirmingDelete.set(false);
        this.deleting.set(false);
      }
    });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.registryApi.getManifest(this.repositoryName, this.tagName).subscribe({
      next: (manifest) => {
        this.manifest.set(manifest);
        this.loading.set(false);

        if (manifest.kind === 'manifest') {
          this.registryApi.getImageConfig(this.repositoryName, manifest.config.digest).subscribe({
            next: (config) => this.imageConfig.set(config),
            error: () => {
              // Image config is a nice-to-have; the manifest details above remain usable without it.
            }
          });
        }
      },
      error: () => {
        this.error.set('Failed to load manifest.');
        this.loading.set(false);
      }
    });
  }
}
