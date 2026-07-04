import { Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

export type BannerType = 'error' | 'info' | 'loading' | 'success';

@Component({
  selector: 'app-banner',
  imports: [MatIcon, MatProgressSpinner],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss'
})
export class BannerComponent {
  @Input({ required: true }) type!: BannerType;
  @Input({ required: true }) message!: string;
}
