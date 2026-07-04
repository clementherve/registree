import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerComponent } from './banner.component';

describe('BannerComponent', () => {
  let fixture: ComponentFixture<BannerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [BannerComponent] });
    fixture = TestBed.createComponent(BannerComponent);
    fixture.componentInstance.type = 'error';
    fixture.componentInstance.message = 'Something went wrong';
    fixture.detectChanges();
  });

  it('renders the message', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Something went wrong');
  });

  it('applies the type as a CSS class', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.banner.error')).toBeTruthy();
  });
});
