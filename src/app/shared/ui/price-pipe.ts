import { Pipe, type PipeTransform } from '@angular/core';

const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' });

/** Formats a price in cents: `450 | price` gives `€4.50`. */
@Pipe({ name: 'price' })
export class PricePipe implements PipeTransform {
  transform(cents: number): string {
    return formatter.format(cents / 100);
  }
}
