import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FinancialProductService } from './financial-product.service';
import { environment } from '../../environments/environment';
import { FinancialProduct } from '../models/financial-product.model';

describe('FinancialProductService', () => {
  let service: FinancialProductService;
  let httpMock: HttpTestingController;

  const mockProduct: FinancialProduct = {
    id: '1',
    name: 'Cuenta Ahorro',
    description: 'Cuenta de ahorros básica',
    logo: 'ahorro.png',
    date_release: '2025-01-01',
    date_revision: '2026-01-01'
  };

  const mockProducts: FinancialProduct[] = [mockProduct];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FinancialProductService]
    });

    service = TestBed.inject(FinancialProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya peticiones pendientes
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch products', () => {
    service.getProducts().subscribe((products) => {
      expect(products.length).toBe(1);
      expect(products).toEqual(mockProducts);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/bp/products`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProducts);
  });
});
