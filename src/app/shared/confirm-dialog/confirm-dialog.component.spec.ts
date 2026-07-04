import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ConfirmDialogComponent] });
    fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.componentInstance.title = 'Delete tag?';
    fixture.componentInstance.message = 'This cannot be undone.';
    fixture.detectChanges();
  });

  it('emits confirmed when the confirm button is clicked', () => {
    const spy = spyOn(fixture.componentInstance.confirmed, 'emit');
    const buttons = fixture.nativeElement.querySelectorAll('button');
    (buttons[1] as HTMLButtonElement).click();
    expect(spy).toHaveBeenCalled();
  });

  it('emits cancelled when the cancel button is clicked', () => {
    const spy = spyOn(fixture.componentInstance.cancelled, 'emit');
    const buttons = fixture.nativeElement.querySelectorAll('button');
    (buttons[0] as HTMLButtonElement).click();
    expect(spy).toHaveBeenCalled();
  });
});
