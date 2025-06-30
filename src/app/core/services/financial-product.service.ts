import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FinancialProduct } from '../models/financial-product.model';
import { environment } from '../../environments/environment';
import { Observable, of, map, catchError, tap, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FinancialProductService {
  private readonly apiUrl = `${environment.apiUrl}/bp/products`;
  private cachedProducts$?: Observable<FinancialProduct[]>; // Cache como Observable

  constructor(private http: HttpClient) {}

  getProducts(): Observable<FinancialProduct[]> {
  
    if (this.cachedProducts$) {
      return this.cachedProducts$;
    }

   
    this.cachedProducts$ = this.http.get<any>(this.apiUrl).pipe(
      map(response => {
       
        const products = Array.isArray(response) ? response : (response?.data || []);
        console.log('Productos cargados:', products.length);
        return products;
      }),
      catchError(error => {
        console.error('Error al cargar productos:', error);
        return of([]);
      }),
      shareReplay(1) 
    );

    return this.cachedProducts$;
  }


  verifyId(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${environment.apiUrl}/bp/products/verification/${id}`);
  }

  createProduct(product: FinancialProduct): Observable<any> {
    return this.http.post<any>(this.apiUrl, product);
  }

  updateProduct(id: string, product: Partial<FinancialProduct>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}