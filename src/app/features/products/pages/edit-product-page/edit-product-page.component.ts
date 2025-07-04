import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FinancialProduct } from '../../../../core/models/financial-product.model';
import { FinancialProductService } from '../../../../core/services/financial-product.service';
import { MessageService } from '../../../../core/services/message.service';
import { ProductFormComponent } from '../../components/product-form/product-form.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

// Interfaces for better type safety
interface EditPageState {
  product: FinancialProduct | null;
  isLoading: boolean;
  errorMessage: string | null;
}

interface LoadProductResult {
  product: FinancialProduct | null;
  error: string | null;
}

@Component({
  selector: 'app-edit-product-page',
  standalone: true,
  imports: [
    CommonModule,
    ProductFormComponent,
    LoadingComponent,
    ErrorMessageComponent
  ],
  templateUrl: './edit-product-page.component.html',
  styleUrls: ['./edit-product-page.component.scss']
})
export class EditProductPageComponent implements OnInit, OnDestroy {
  // State management
  private state: EditPageState = {
    product: null,
    isLoading: false,
    errorMessage: null
  };

  // Subscription management
  private readonly destroy$ = new Subject<void>();

  // Computed properties for template
  get product(): FinancialProduct | null { return this.state.product; }
  get isLoading(): boolean { return this.state.isLoading; }
  get errorMessage(): string | null { return this.state.errorMessage; }

  // Constants
  private static readonly SUCCESS_MESSAGE = 'Producto actualizado exitosamente';
  private static readonly PRODUCT_NOT_FOUND_MESSAGE = 'Producto no encontrado';
  private static readonly NO_PRODUCT_ID_MESSAGE = 'ID de producto no proporcionado';
  private static readonly NO_PRODUCT_TO_UPDATE_MESSAGE = 'No hay producto para actualizar';
  private static readonly DEFAULT_ERROR_MESSAGE = 'Error al procesar la solicitud';
  private static readonly UNKNOWN_ERROR_MESSAGE = 'Error desconocido al procesar la solicitud';
  private static readonly PRODUCTS_ROUTE = '/products';

  constructor(
    private readonly productService: FinancialProductService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize component and load product
   */
  private initializeComponent(): void {
    const productId = this.extractProductIdFromRoute();
    
    if (!productId) {
      this.handleMissingProductId();
      return;
    }

    this.loadProduct(productId);
  }

  /**
   * Extract product ID from route parameters
   */
  private extractProductIdFromRoute(): string | null {
    return this.route.snapshot.paramMap.get('id');
  }

  /**
   * Handle missing product ID
   */
  private handleMissingProductId(): void {
    this.updateState({
      errorMessage: EditProductPageComponent.NO_PRODUCT_ID_MESSAGE
    });
  }

  /**
   * Load product by ID
   */
  private loadProduct(id: string): void {
    this.updateState({
      isLoading: true,
      errorMessage: null
    });
    
    this.productService.getProducts()
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (products) => this.handleProductsLoaded(products, id),
        error: (error) => this.handleLoadError(error)
      });
  }

  /**
   * Handle successful products load
   */
  private handleProductsLoaded(products: FinancialProduct[], id: string): void {
    const result = this.findProductById(products, id);
    
    this.updateState({
      product: result.product,
      errorMessage: result.error,
      isLoading: false
    });
  }

  /**
   * Find product by ID and return result
   */
  private findProductById(products: FinancialProduct[], id: string): LoadProductResult {
    const foundProduct = products.find(product => product.id === id);
    
    if (!foundProduct) {
      return {
        product: null,
        error: EditProductPageComponent.PRODUCT_NOT_FOUND_MESSAGE
      };
    }

    return {
      product: { ...foundProduct },
      error: null
    };
  }

  /**
   * Handle product load error
   */
  private handleLoadError(error: unknown): void {
    console.error('Error loading product:', error);
    
    this.updateState({
      errorMessage: this.extractErrorMessage(error),
      isLoading: false
    });
  }

  /**
   * Handle form submission
   */
  onSubmit(updatedProduct: FinancialProduct): void {
    if (!this.canUpdateProduct()) {
      this.handleNoProductToUpdate();
      return;
    }
    
    this.updateProduct(updatedProduct);
  }

  /**
   * Check if product can be updated
   */
  private canUpdateProduct(): boolean {
    return this.product !== null;
  }

  /**
   * Handle case when no product is available for update
   */
  private handleNoProductToUpdate(): void {
    this.updateState({
      errorMessage: EditProductPageComponent.NO_PRODUCT_TO_UPDATE_MESSAGE
    });
  }

  /**
   * Update product with proper error handling
   */
  private updateProduct(updatedProduct: FinancialProduct): void {
    if (!this.product) {
      return;
    }

    this.updateState({
      isLoading: true,
      errorMessage: null
    });
    
    this.productService.updateProduct(this.product.id, updatedProduct)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => this.handleUpdateSuccess(),
        error: (error) => this.handleUpdateError(error)
      });
  }

  /**
   * Handle successful product update
   */
  private handleUpdateSuccess(): void {
    this.showSuccessMessage();
    this.navigateToProductsList();
  }

  /**
   * Show success message
   */
  private showSuccessMessage(): void {
    this.messageService.showSuccess(EditProductPageComponent.SUCCESS_MESSAGE);
  }

  /**
   * Navigate to products list
   */
  private navigateToProductsList(): void {
    this.router.navigate([EditProductPageComponent.PRODUCTS_ROUTE]);
  }

  /**
   * Handle product update error
   */
  private handleUpdateError(error: unknown): void {
    console.error('Error updating product:', error);
    
    this.updateState({
      errorMessage: this.extractErrorMessage(error),
      isLoading: false
    });
  }

  /**
   * Extract error message from error object
   */
  private extractErrorMessage(error: unknown): string {
    if (this.isErrorWithMessage(error)) {
      return error.message || EditProductPageComponent.DEFAULT_ERROR_MESSAGE;
    }
    
    return EditProductPageComponent.UNKNOWN_ERROR_MESSAGE;
  }

  /**
   * Type guard to check if error has message property
   */
  private isErrorWithMessage(error: unknown): error is Error {
    return error instanceof Error;
  }

  /**
   * Update component state immutably
   */
  private updateState(updates: Partial<EditPageState>): void {
    this.state = { ...this.state, ...updates };
  }
}