import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { RegistryApiService } from './registry-api.service';
import { environment } from '../../../environments/environment';

describe('RegistryApiService', () => {
  let service: RegistryApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(RegistryApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists repositories and parses the next cursor from the Link header', () => {
    let result: any;
    service.listRepositories(50).subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.url === `${environment.apiBasePath}/_catalog`);
    req.flush(
      { repositories: ['a', 'b'] },
      { headers: { Link: '</v2/_catalog?last=b&n=50>; rel="next"' } }
    );

    expect(result.items).toEqual([{ name: 'a' }, { name: 'b' }]);
    expect(result.next).toBe('b');
  });

  it('reports no next page when the Link header is absent, regardless of how many items came back', () => {
    // Registry v3 proxy mode clamps an oversized `n` instead of erroring, so a page can
    // come back shorter than requested with no `Link` header — that alone must mean "last page".
    let result: any;
    service.listRepositories(50).subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.url === `${environment.apiBasePath}/_catalog`);
    req.flush({ repositories: ['a'] });

    expect(result.items).toEqual([{ name: 'a' }]);
    expect(result.next).toBeNull();
  });

  it('maps a 404 on tags/list to an empty result instead of an error', () => {
    let result: any;
    service.listTags('my-repo', 50).subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.url === `${environment.apiBasePath}/my-repo/tags/list`);
    req.flush('not found', { status: 404, statusText: 'Not Found' });

    expect(result).toEqual({ items: [], next: null });
  });

  it('resolves the manifest digest from the Docker-Content-Digest header', fakeAsync(() => {
    let result: any;
    service.getManifest('my-repo', 'latest').subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.url === `${environment.apiBasePath}/my-repo/manifests/latest`);
    req.flush(
      JSON.stringify({
        schemaVersion: 2,
        mediaType: 'application/vnd.docker.distribution.manifest.v2+json',
        config: { mediaType: 'application/vnd.docker.container.image.v1+json', size: 100, digest: 'sha256:config' },
        layers: [{ mediaType: 'application/vnd.docker.image.rootfs.diff.tar.gzip', size: 200, digest: 'sha256:layer1' }]
      }),
      { headers: { 'Docker-Content-Digest': 'sha256:manifestdigest' } }
    );
    tick();

    expect(result.kind).toBe('manifest');
    expect(result.digest).toBe('sha256:manifestdigest');
    expect(result.layers.length).toBe(1);
  }));

  it('falls back to computing the digest when Docker-Content-Digest is not exposed', async () => {
    const resultPromise = firstValueFrom(service.getManifest('my-repo', 'latest'));

    const rawBody = JSON.stringify({
      schemaVersion: 2,
      mediaType: 'application/vnd.docker.distribution.manifest.v2+json',
      config: { mediaType: 'application/vnd.docker.container.image.v1+json', size: 100, digest: 'sha256:config' },
      layers: []
    });

    const req = httpMock.expectOne((r) => r.url === `${environment.apiBasePath}/my-repo/manifests/latest`);
    req.flush(rawBody);

    const result: any = await resultPromise;
    expect(result.digest).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it('detects a manifest list response by media type', fakeAsync(() => {
    let result: any;
    service.getManifest('my-repo', 'latest').subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.url === `${environment.apiBasePath}/my-repo/manifests/latest`);
    req.flush(
      JSON.stringify({
        schemaVersion: 2,
        mediaType: 'application/vnd.docker.distribution.manifest.list.v2+json',
        manifests: []
      }),
      { headers: { 'Docker-Content-Digest': 'sha256:listdigest' } }
    );
    tick();

    expect(result.kind).toBe('manifestList');
  }));

  it('deletes a manifest by digest', () => {
    service.deleteManifest('my-repo', 'sha256:abc').subscribe();

    const req = httpMock.expectOne(`${environment.apiBasePath}/my-repo/manifests/sha256:abc`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
