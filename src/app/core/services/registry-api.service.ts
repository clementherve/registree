import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, catchError, from, map, of, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { PaginatedResult, Repository } from '../models/repository.model';
import { Tag } from '../models/tag.model';
import { ManifestList, ManifestListEntry, ManifestV2 } from '../models/manifest.model';
import { ImageConfig } from '../models/image-config.model';
import { parseNextLinkCursor } from './link-header-parser.util';
import { computeManifestDigest } from './manifest-digest.util';

const MANIFEST_ACCEPT_HEADER =
  'application/vnd.docker.distribution.manifest.v2+json, application/vnd.oci.image.manifest.v1+json';

const MANIFEST_LIST_MEDIA_TYPES = new Set([
  'application/vnd.docker.distribution.manifest.list.v2+json',
  'application/vnd.oci.image.index.v1+json'
]);

interface CatalogResponse {
  repositories: string[];
}

interface TagsListResponse {
  name: string;
  tags: string[] | null;
}

interface ManifestV2Response {
  schemaVersion: number;
  mediaType: string;
  config: { mediaType: string; size: number; digest: string };
  layers: { mediaType: string; size: number; digest: string }[];
}

interface ManifestListResponse {
  schemaVersion: number;
  mediaType: string;
  manifests: ManifestListEntry[];
}

@Injectable({ providedIn: 'root' })
export class RegistryApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBasePath;

  ping(): Observable<void> {
    return this.http.get<void>(`${this.base}/`);
  }

  listRepositories(n: number, last?: string): Observable<PaginatedResult<Repository>> {
    let params = new HttpParams().set('n', n);
    if (last) params = params.set('last', last);

    return this.http
      .get<CatalogResponse>(`${this.base}/_catalog`, { params, observe: 'response' })
      .pipe(
        map((response) => ({
          items: (response.body?.repositories ?? []).map((name) => ({ name })),
          next: parseNextLinkCursor(response.headers.get('Link'))
        }))
      );
  }

  listTags(name: string, n: number, last?: string): Observable<PaginatedResult<Tag>> {
    let params = new HttpParams().set('n', n);
    if (last) params = params.set('last', last);

    return this.http
      .get<TagsListResponse>(`${this.base}/${name}/tags/list`, { params, observe: 'response' })
      .pipe(
        map((response) => ({
          items: (response.body?.tags ?? []).map((tagName) => ({ name: tagName, repository: name })),
          next: parseNextLinkCursor(response.headers.get('Link'))
        })),
        catchError((err) => {
          if (err.status === 404) {
            return of({ items: [], next: null });
          }
          throw err;
        })
      );
  }

  getManifest(name: string, reference: string): Observable<ManifestV2 | ManifestList> {
    return this.http
      .get(`${this.base}/${name}/manifests/${reference}`, {
        headers: { Accept: MANIFEST_ACCEPT_HEADER },
        observe: 'response',
        responseType: 'text'
      })
      .pipe(switchMap((response) => from(this.parseManifestResponse(response))));
  }

  private async parseManifestResponse(response: HttpResponse<string>): Promise<ManifestV2 | ManifestList> {
    const rawBody = response.body ?? '';
    const body = JSON.parse(rawBody) as ManifestV2Response | ManifestListResponse;

    // Cross-origin responses only expose this header if the server lists it in
    // Access-Control-Expose-Headers, so fall back to computing it the same way the
    // registry does: sha256 of the exact raw response bytes.
    const digest = response.headers.get('Docker-Content-Digest') ?? (await computeManifestDigest(rawBody));

    if (MANIFEST_LIST_MEDIA_TYPES.has(body.mediaType)) {
      const listBody = body as ManifestListResponse;
      return {
        kind: 'manifestList' as const,
        schemaVersion: listBody.schemaVersion,
        mediaType: listBody.mediaType,
        manifests: listBody.manifests,
        digest
      };
    }

    const manifestBody = body as ManifestV2Response;
    return {
      kind: 'manifest' as const,
      schemaVersion: manifestBody.schemaVersion,
      mediaType: manifestBody.mediaType,
      config: manifestBody.config,
      layers: manifestBody.layers,
      digest
    };
  }

  getImageConfig(name: string, digest: string): Observable<ImageConfig> {
    return this.http.get<ImageConfig>(`${this.base}/${name}/blobs/${digest}`);
  }

  deleteManifest(name: string, digest: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${name}/manifests/${digest}`);
  }
}
