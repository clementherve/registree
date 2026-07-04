import { Component, Input } from '@angular/core';

export type BannerType = 'error' | 'info' | 'loading' | 'success';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss'
})
export class BannerComponent {
  @Input({ required: true }) type!: BannerType;
  @Input({ required: true }) message!: string;
}
