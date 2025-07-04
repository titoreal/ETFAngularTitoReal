import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductFormComponent } from './product-form.component';
import { FinancialProductService } from '../../../../core/services/financial-product.service';
import { FinancialProduct } from '../../../../core/models/financial-product.model';
import { FormsModule, NgModel } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { CommonModule } from '@angular/common';

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let productService: jasmine.SpyObj<FinancialProductService>;
  let route: jasmine.SpyObj<ActivatedRoute>;

  const mockProduct: FinancialProduct = {
    id: 'test-id',
    name: 'Test Product',
    description: 'Test Description',
    logo: 'test-logo.png',
    date_release: '2025-01-01',
    date_revision: '2026-01-01',
  };

  const mockEmptyProduct: FinancialProduct = {
    id: '',
    name: '',
    description: '',
    logo: '',
    date_release: '',
    date_revision: '',
  };

  beforeEach(async () => {
    productService = jasmine.createSpyObj('FinancialProductService', [
      'getProducts',
      'verifyId',
    ]);
    route = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: { paramMap: { get: () => null } },
    });

    await TestBed.configureTestingModule({
      imports: [
        ProductFormComponent,
        CommonModule,
        FormsModule,
        LoadingComponent,
        ErrorMessageComponent,
      ],
      providers: [
        { provide: FinancialProductService, useValue: productService },
        { provide: ActivatedRoute, useValue: route },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with empty product', () => {
      expect(component.product).toEqual(mockEmptyProduct);
    });

    it('should initialize with provided product', () => {
      component.initialProduct = mockProduct;
      component.ngOnInit();
      expect(component.product).toEqual(mockProduct);
    });

    it('should load product from route', () => {
      route.snapshot.paramMap.get = () => 'test-id';
      productService.getProducts.and.returnValue(of([mockProduct]));

      component.ngOnInit();

      expect(productService.getProducts).toHaveBeenCalled();
      expect(component.product).toEqual(mockProduct);
    });
  });

  describe('ID Validation', () => {
    it('should validate ID when conditions are met', () => {
      const idControl = {
        value: 'test-id',
        control: {
          setErrors: jasmine.createSpy('setErrors'),
        },
      } as unknown as NgModel;

      productService.verifyId.and.returnValue(of(false));
      component.validateId(idControl);
      expect(productService.verifyId).toHaveBeenCalledWith('test-id');
    });

    it('should skip validation when ID is too short', () => {
      const idControl = {
        value: 'ab',
        control: {
          setErrors: jasmine.createSpy('setErrors'),
        },
      } as unknown as NgModel;

      component.validateId(idControl);
      expect(productService.verifyId).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('should emit form data when valid', () => {
      spyOn(component.formSubmitted, 'emit');
      component.product = mockProduct;
      component.onSubmit();
      expect(component.formSubmitted.emit).toHaveBeenCalledWith(mockProduct);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', () => {
      productService.getProducts.and.returnValue(
        throwError(() => new Error('Error'))
      );
      component.loadProduct('test-id');
      expect(component.error).toBe('Error al cargar el producto');
    });
  });
});
