import { Pipe, PipeTransform } from '@angular/core';

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

@Pipe({ name: 'byteSize' })
export class ByteSizePipe implements PipeTransform {
  transform(bytes: number | null | undefined): string {
    if (bytes == null || Number.isNaN(bytes)) return '—';
    if (bytes === 0) return '0 B';

    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1);
    const value = bytes / Math.pow(1024, exponent);

    return `${exponent === 0 ? value : value.toFixed(1)} ${UNITS[exponent]}`;
  }
}
