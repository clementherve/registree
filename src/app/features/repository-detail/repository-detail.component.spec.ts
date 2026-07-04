import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { RepositoryDetailComponent } from './repository-detail.component';
import { environment } from '../../../environments/environment';

describe('RepositoryDetailComponent', () => {
  let fixture: ComponentFixture<RepositoryDetailComponent>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RepositoryDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ name: 'my-repo' }) } }
        }
      ]
    });
    fixture = TestBed.createComponent(RepositoryDetailComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads tags for the repository from the route param', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne((r) => r.url === `${environment.apiBasePath}/my-repo/tags/list`);
    req.flush({ name: 'my-repo', tags: ['v1', 'v2'] });

    expect(fixture.componentInstance.tags()).toEqual([
      { name: 'v1', repository: 'my-repo' },
      { name: 'v2', repository: 'my-repo' }
    ]);
  });

  it('resolves the digest and deletes a tag on confirm', fakeAsync(() => {
    fixture.detectChanges();
    httpMock
      .expectOne((r) => r.url === `${environment.apiBasePath}/my-repo/tags/list`)
      .flush({ name: 'my-repo', tags: ['v1'] });

    fixture.componentInstance.requestDelete('v1');
    httpMock
      .expectOne((r) => r.url === `${environment.apiBasePath}/my-repo/manifests/v1`)
      .flush(
        JSON.stringify({
          schemaVersion: 2,
          mediaType: 'application/vnd.docker.distribution.manifest.v2+json',
          config: { digest: 'x', size: 1, mediaType: 'x' },
          layers: []
        }),
        { headers: { 'Docker-Content-Digest': 'sha256:abc' } }
      );
    tick();

    expect(fixture.componentInstance.pendingDelete()).toEqual({ tagName: 'v1', digest: 'sha256:abc' });

    fixture.componentInstance.confirmDelete();
    httpMock.expectOne(`${environment.apiBasePath}/my-repo/manifests/sha256:abc`).flush(null);

    expect(fixture.componentInstance.tags()).toEqual([]);
    expect(fixture.componentInstance.successMessage()).toBeTruthy();
  }));
});
