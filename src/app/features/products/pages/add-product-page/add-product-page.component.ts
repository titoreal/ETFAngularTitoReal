import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FinancialProduct } from '../../../../core/models/financial-product.model';
import { FinancialProductService } from '../../../../core/services/financial-product.service';
import { MessageService } from '../../../../core/services/message.service';
import { ProductFormComponent } from '../../components/product-form/product-form.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

// Interfaces for better type safety
interface PageState {
  isLoading: boolean;
  errorMessage: string | null;
}

interface NavigationOptions {
  onSameUrlNavigation: 'reload' | 'ignore';
}

@Component({
  selector: 'app-add-product-page',
  standalone: true,
  imports: [
    CommonModule,
    ProductFormComponent,
    LoadingComponent,
    ErrorMessageComponent,
  ],
  templateUrl: './add-product-page.component.html',
  styleUrls: ['./add-product-page.component.scss'],
})
export class AddProductPageComponent implements OnDestroy {
  // State management
  private state: PageState = {
    isLoading: false,
    errorMessage: null
  };

  // Subscription management
  private readonly destroy$ = new Subject<void>();

  // Computed properties for template
  get isLoading(): boolean { return this.state.isLoading; }
  get errorMessage(): string | null { return this.state.errorMessage; }

  // Constants
  private static readonly SUCCESS_MESSAGE = 'Producto creado exitosamente';
  private static readonly DEFAULT_ERROR_MESSAGE = 'Error al crear el producto';
  private static readonly UNKNOWN_ERROR_MESSAGE = 'Error desconocido al crear el producto';
  private static readonly PRODUCTS_ROUTE = '/products';

  constructor(
    private readonly productService: FinancialProductService,
    private readonly router: Router,
    private readonly messageService: MessageService
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handle form submission
   */
  onSubmit(product: FinancialProduct): void {
    if (!this.isValidProduct(product)) {
      this.handleInvalidProduct();
      return;
    }

    this.createProduct(product);
  }

  /**
   * Validate product data
   */
  private isValidProduct(product: FinancialProduct): boolean {
    return !!(product.id && product.name && product.description);
  }

  /**
   * Handle invalid product submission
   */
  private handleInvalidProduct(): void {
    this.updateState({
      errorMessage: 'Datos del producto inválidos'
    });
  }

  /**
   * Create product with proper error handling
   */
  private createProduct(product: FinancialProduct): void {
    this.updateState({
      isLoading: true,
      errorMessage: null
    });

    this.productService.createProduct(product)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => this.handleCreateSuccess(),
        error: (error) => this.handleCreateError(error)
      });
  }

  /**
   * Handle successful product creation
   */
  private handleCreateSuccess(): void {
    this.showSuccessMessage();
    this.navigateToProductsList();
  }

  /**
   * Show success message
   */
  private showSuccessMessage(): void {
    this.messageService.showSuccess(AddProductPageComponent.SUCCESS_MESSAGE);
  }

  /**
   * Navigate to products list
   */
  private navigateToProductsList(): void {
    const navigationOptions: NavigationOptions = {
      onSameUrlNavigation: 'reload'
    };

    this.router.navigate([AddProductPageComponent.PRODUCTS_ROUTE], navigationOptions);
  }

  /**
   * Handle product creation error
   */
  private handleCreateError(error: unknown): void {
    console.error('Error creating product:', error);
    
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
      return error.message || AddProductPageComponent.DEFAULT_ERROR_MESSAGE;
    }
    
    return AddProductPageComponent.UNKNOWN_ERROR_MESSAGE;
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
  private updateState(updates: Partial<PageState>): void {
    this.state = { ...this.state, ...updates };
  }
}