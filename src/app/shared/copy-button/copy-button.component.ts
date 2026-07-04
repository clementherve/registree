import { Component, Input, signal } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-copy-button',
  imports: [MatIconButton, MatIcon, MatTooltip],
  templateUrl: './copy-button.component.html',
  styleUrl: './copy-button.component.scss'
})
export class CopyButtonComponent {
  @Input({ required: true }) value!: string;
  @Input() label = 'Copy to clipboard';

  copied = signal(false);
  private resetHandle?: ReturnType<typeof setTimeout>;

  constructor(private readonly clipboard: Clipboard) {}

  copy(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    this.clipboard.copy(this.value);
    this.copied.set(true);

    clearTimeout(this.resetHandle);
    this.resetHandle = setTimeout(() => this.copied.set(false), 1500);
  }
}
