import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { EditProductPageComponent } from './edit-product-page.component';
import { FinancialProductService } from '../../../../core/services/financial-product.service';
import { MessageService } from '../../../../core/services/message.service';
import { FinancialProduct } from '../../../../core/models/financial-product.model';
import { ProductFormComponent } from '../../components/product-form/product-form.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

describe('EditProductPageComponent', () => {
  let component: EditProductPageComponent;
  let fixture: ComponentFixture<EditProductPageComponent>;
  let mockProductService: jasmine.SpyObj<FinancialProductService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockRoute: jasmine.SpyObj<ActivatedRoute>;
  let mockMessageService: jasmine.SpyObj<MessageService>;

  const mockProduct: FinancialProduct = {
    id: 'test-id',
    name: 'Test Product',
    description: 'Test Description',
    logo: 'test-logo.png',
    date_release: '2025-01-01',
    date_revision: '2026-01-01'
  };

  const mockUpdatedProduct: FinancialProduct = {
    ...mockProduct,
    name: 'Updated Product',
    description: 'Updated Description'
  };

  beforeEach(async () => {
    const productServiceSpy = jasmine.createSpyObj('FinancialProductService', ['getProducts', 'updateProduct']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: { paramMap: { get: jasmine.createSpy('get') } }
    });
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['showSuccess']);

    await TestBed.configureTestingModule({
      imports: [
        EditProductPageComponent,
        ProductFormComponent,
        LoadingComponent,
        ErrorMessageComponent
      ],
      providers: [
        { provide: FinancialProductService, useValue: productServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: routeSpy },
        { provide: MessageService, useValue: messageServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditProductPageComponent);
    component = fixture.componentInstance;
    mockProductService = TestBed.inject(FinancialProductService) as jasmine.SpyObj<FinancialProductService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    mockMessageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with correct default values', () => {
      expect(component.product).toBe(null);
      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toBe(null);
    });

    it('should load product on init when ID is provided', () => {
      mockRoute.snapshot.paramMap.get = jasmine.createSpy('get').and.returnValue('test-id');
      mockProductService.getProducts.and.returnValue(of([mockProduct]));

      component.ngOnInit();

      expect(mockProductService.getProducts).toHaveBeenCalled();
      expect(component.product).toEqual(mockProduct);
    });

    it('should handle missing product ID', () => {
      mockRoute.snapshot.paramMap.get = jasmine.createSpy('get').and.returnValue(null);

      component.ngOnInit();

      expect(component.errorMessage).toBe('ID de producto no proporcionado');
      expect(mockProductService.getProducts).not.toHaveBeenCalled();
    });
  });

  describe('Product Loading', () => {
    beforeEach(() => {
      mockRoute.snapshot.paramMap.get = jasmine.createSpy('get').and.returnValue('test-id');
    });

    it('should load product successfully', () => {
      mockProductService.getProducts.and.returnValue(of([mockProduct]));

      component.ngOnInit();

      expect(component.product).toEqual(mockProduct);
      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toBe(null);
    });

    it('should handle product not found', () => {
      mockProductService.getProducts.and.returnValue(of([]));

      component.ngOnInit();

      expect(component.product).toBe(null);
      expect(component.errorMessage).toBe('Producto no encontrado');
      expect(component.isLoading).toBe(false);
    });

    it('should handle multiple products and find correct one', () => {
      const otherProduct: FinancialProduct = {
        ...mockProduct,
        id: 'other-id',
        name: 'Other Product'
      };
      mockProductService.getProducts.and.returnValue(of([otherProduct, mockProduct]));

      component.ngOnInit();

      expect(component.product).toEqual(mockProduct);
    });

    it('should handle service error', () => {
      mockProductService.getProducts.and.returnValue(throwError(() => new Error('Service error')));

      component.ngOnInit();

      expect(component.product).toBe(null);
      expect(component.errorMessage).toBe('Service error');
      expect(component.isLoading).toBe(false);
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      // Simula que el producto ya fue cargado
      component['state'] = {
        product: mockProduct,
        isLoading: false,
        errorMessage: null
      };
    });

    it('should update product on valid submission', () => {
      mockProductService.updateProduct.and.returnValue(of(null));

      component.onSubmit(mockUpdatedProduct);

      expect(mockProductService.updateProduct).toHaveBeenCalledWith('test-id', mockUpdatedProduct);
      expect(mockMessageService.showSuccess).toHaveBeenCalledWith('Producto actualizado exitosamente');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    });

    it('should handle update error', () => {
      mockProductService.updateProduct.and.returnValue(
        throwError(() => new Error('Update error'))
      );

      component.onSubmit(mockUpdatedProduct);

      expect(component.errorMessage).toBe('Update error');
      expect(component.isLoading).toBe(false);
    });

    it('should not update product if product is null', () => {
      component['state'].product = null;

      component.onSubmit(mockUpdatedProduct);

      expect(component.errorMessage).toBe('No hay producto para actualizar');
      expect(mockProductService.updateProduct).not.toHaveBeenCalled();
    });
  });
});
