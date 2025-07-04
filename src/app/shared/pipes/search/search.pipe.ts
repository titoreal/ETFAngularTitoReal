import { Pipe, PipeTransform } from '@angular/core';
import { FinancialProduct } from '../../../core/models/financial-product.model';

@Pipe({
  name: 'search',
  standalone: true
})
export class SearchPipe implements PipeTransform {
  transform(products: FinancialProduct[], term: string = ''): FinancialProduct[] {
    if (!term || !products) return products;
    
    term = term.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      // ← CORREGIDO: El ID puede ser número, convertir a string primero
      product.id.toString().toLowerCase().includes(term)
    );
  }
}