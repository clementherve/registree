import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';

import { TagDetailComponent } from './tag-detail.component';
import { environment } from '../../../environments/environment';

describe('TagDetailComponent', () => {
  let fixture: ComponentFixture<TagDetailComponent>;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TagDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ name: 'my-repo', tag: 'latest' }) } }
        }
      ]
    });
    fixture = TestBed.createComponent(TagDetailComponent);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => httpMock.verify());

  function flushManifest() {
    httpMock
      .expectOne((r) => r.url === `${environment.apiBasePath}/my-repo/manifests/latest`)
      .flush(
        JSON.stringify({
          schemaVersion: 2,
          mediaType: 'application/vnd.docker.distribution.manifest.v2+json',
          config: { mediaType: 'x', size: 100, digest: 'sha256:config' },
          layers: [{ mediaType: 'x', size: 200, digest: 'sha256:layer1' }]
        }),
        { headers: { 'Docker-Content-Digest': 'sha256:manifestdigest' } }
      );
    tick();
    httpMock
      .expectOne((r) => r.url === `${environment.apiBasePath}/my-repo/blobs/sha256:config`)
      .flush({ architecture: 'amd64', os: 'linux', created: '2024-01-01T00:00:00Z' });
  }

  it('computes total size and layer count from the manifest', fakeAsync(() => {
    fixture.detectChanges();
    flushManifest();

    expect(fixture.componentInstance.totalSize()).toBe(300);
    expect(fixture.componentInstance.layerCount()).toBe(1);
    expect(fixture.componentInstance.imageConfig()?.architecture).toBe('amd64');
  }));

  it('deletes the tag and navigates back to the repository', fakeAsync(() => {
    const navigateSpy = spyOn(router, 'navigate');
    fixture.detectChanges();
    flushManifest();

    fixture.componentInstance.confirmDelete();

    httpMock.expectOne(`${environment.apiBasePath}/my-repo/manifests/sha256:manifestdigest`).flush(null);

    expect(navigateSpy).toHaveBeenCalledWith(['/repositories', 'my-repo']);
  }));
});
