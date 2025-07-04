import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListComponent } from '../../components/product-list/product-list.component';
import { FinancialProductService } from '../../../../core/services/financial-product.service';
import { FinancialProduct } from '../../../../core/models/financial-product.model';
import { Router, ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchPipe } from '../../../../shared/pipes/search/search.pipe';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { RouterLink } from '@angular/router';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let productService: jasmine.SpyObj<FinancialProductService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let cdr: jasmine.SpyObj<ChangeDetectorRef>;

  const mockProducts: FinancialProduct[] = [
    {
      id: '1',
      name: 'Product 1',
      description: 'Description 1',
      logo: 'logo1.png',
      date_release: new Date('2023-01-01'),
      date_revision: new Date('2024-01-01'),
    }
  ];

  beforeEach(async () => {
    productService = jasmine.createSpyObj('FinancialProductService', ['getProducts', 'deleteProduct']);
    router = jasmine.createSpyObj('Router', ['navigate'], { events: of({}) });
    activatedRoute = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: { paramMap: { get: () => null } }
    });
    cdr = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    await TestBed.configureTestingModule({
      imports: [
        ProductListComponent,
        CommonModule,
        FormsModule,
        SearchPipe,
        LoadingComponent,
        ErrorMessageComponent,
        RouterLink
      ],
      providers: [
        { provide: FinancialProductService, useValue: productService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: ChangeDetectorRef, useValue: cdr }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on init', () => {
    productService.getProducts.and.returnValue(of(mockProducts));
    component.ngOnInit();
    expect(component.products()).toEqual(mockProducts);
  });

  it('should handle error when loading products', () => {
    productService.getProducts.and.returnValue(throwError(() => new Error('Error')));
    component.loadProducts();
    expect(component.error()).toBe('No se encontraron productos');
  });

  describe('Delete Modal', () => {
    it('should open delete modal with selected product', () => {
      component.openDeleteModal(mockProducts[0]);
      expect(component.showDeleteModal).toBeTrue();
      expect(component.productToDelete).toEqual(mockProducts[0]);
    });

    it('should close delete modal and reset productToDelete', () => {
      component.showDeleteModal = true;
      component.productToDelete = mockProducts[0];
      component.closeDeleteModal();
      expect(component.showDeleteModal).toBeFalse();
      expect(component.productToDelete).toBeNull();
    });
  });

  describe('Product Deletion', () => {
    it('should delete the selected product and call service', () => {
      productService.deleteProduct.and.returnValue(of({}));
      component.productToDelete = mockProducts[0];
      component.confirmDelete();
      expect(productService.deleteProduct).toHaveBeenCalledWith('1');
    });

    it('should handle error if product deletion fails', () => {
      productService.deleteProduct.and.returnValue(throwError(() => new Error('Error')));
      component.productToDelete = mockProducts[0];
      component.confirmDelete();
      expect(component.error()).toBe('Error desconocido al eliminar el producto');
    });
  });
});