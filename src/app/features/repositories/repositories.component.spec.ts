import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { RepositoriesComponent } from './repositories.component';
import { environment } from '../../../environments/environment';

describe('RepositoriesComponent', () => {
  let fixture: ComponentFixture<RepositoriesComponent>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RepositoriesComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    fixture = TestBed.createComponent(RepositoriesComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads and displays repositories on init', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne((r) => r.url === `${environment.apiBasePath}/_catalog`);
    req.flush({ repositories: ['alpha', 'beta'] });

    expect(fixture.componentInstance.repositories()).toEqual([{ name: 'alpha' }, { name: 'beta' }]);
    expect(fixture.componentInstance.nextCursor()).toBeNull();
  });

  it('filters loaded repositories client-side', () => {
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url === `${environment.apiBasePath}/_catalog`).flush({
      repositories: ['alpha', 'beta']
    });

    fixture.componentInstance.filterTerm.set('al');

    expect(fixture.componentInstance.filteredRepositories()).toEqual([{ name: 'alpha' }]);
  });

  it('appends the next page on loadMore', () => {
    fixture.detectChanges();
    httpMock
      .expectOne((r) => r.url === `${environment.apiBasePath}/_catalog`)
      .flush({ repositories: ['alpha'] }, { headers: { Link: '</v2/_catalog?last=alpha&n=50>; rel="next"' } });

    fixture.componentInstance.loadMore();

    httpMock
      .expectOne((r) => r.url === `${environment.apiBasePath}/_catalog` && r.params.get('last') === 'alpha')
      .flush({ repositories: ['beta'] });

    expect(fixture.componentInstance.repositories()).toEqual([{ name: 'alpha' }, { name: 'beta' }]);
  });
});
