import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { FinancialProduct } from '../../../../core/models/financial-product.model';
import { FinancialProductService } from '../../../../core/services/financial-product.service';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, ErrorMessageComponent],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit, OnChanges {
  @Input() initialProduct: FinancialProduct = this.createEmptyProduct();
  @Input() isEditMode = false;
  @Output() formSubmitted = new EventEmitter<FinancialProduct>();
  @ViewChild('productForm') productForm?: NgForm;

  product: FinancialProduct = this.createEmptyProduct();
  formSubmittedFlag = false;
  isLoading = false;
  error = '';
  idExists = false;
  minDate: string;

  private readonly MIN_ID_LENGTH = 3;
  private readonly VALIDATION_DEBOUNCE_TIME = 300;

  constructor(
    private productService: FinancialProductService,
    private route: ActivatedRoute
  ) {
    this.minDate = new Date().toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.product = { ...this.initialProduct };
    
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId && !this.initialProduct.id) {
      this.loadProduct(productId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialProduct'] && changes['initialProduct'].currentValue) {
      this.product = { ...changes['initialProduct'].currentValue };
    }
  }

  private createEmptyProduct(): FinancialProduct {
    return {
      id: '',
      name: '',
      description: '',
      logo: '',
      date_release: '',
      date_revision: ''
    };
  }

  loadProduct(id: string): void {
    this.isLoading = true;
    this.error = '';
    
    this.productService.getProducts()
      .pipe(
        catchError(error => {
          console.error('Error loading products:', error);
          this.handleLoadError(error);
          return of([]);
        })
      )
      .subscribe(products => {
        const foundProduct = products.find(p => p.id === id);
        if (foundProduct) {
          this.product = { ...foundProduct };
        } else {
          this.error = 'Producto no encontrado';
        }
        this.isLoading = false;
      });
  }

  private handleLoadError(error: any): void {
    this.error = 'Error al cargar el producto';
    this.isLoading = false;
  }

  updateRevisionDate(): void {
    if (!this.product.date_release) return;

    const releaseDate = new Date(this.product.date_release);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (releaseDate < today) {
      this.productForm?.controls['date_release']?.setErrors({ minDate: true });
      return;
    }

    const revisionDate = new Date(releaseDate);
    revisionDate.setFullYear(revisionDate.getFullYear() + 1);
    this.product.date_revision = revisionDate.toISOString().split('T')[0];
  }

  validateId(idControl: NgModel): void {
    if (this.shouldSkipIdValidation(idControl)) {
      return;
    }

    this.performIdValidation(idControl).subscribe();
  }

  private shouldSkipIdValidation(idControl: NgModel): boolean {
    return this.isEditMode || 
           !idControl.value || 
           idControl.value.length < this.MIN_ID_LENGTH;
  }

  private performIdValidation(idControl: NgModel): Observable<boolean> {
    return this.productService.verifyId(idControl.value)
      .pipe(
        debounceTime(this.VALIDATION_DEBOUNCE_TIME),
        distinctUntilChanged(),
        catchError(() => {
          idControl.control?.setErrors({ serverError: true });
          return of(false);
        })
      );
  }

  onSubmit(): void {
    this.formSubmittedFlag = true;
    this.updateRevisionDate();

    if (this.productForm?.valid) {
      this.isLoading = true;
      this.error = '';
      this.formSubmitted.emit(this.product);
    }
  }

  resetForm(): void {
    this.product = this.isEditMode && this.initialProduct.id 
      ? { ...this.initialProduct } 
      : this.createEmptyProduct();
      
    this.formSubmittedFlag = false;
    this.error = '';
    this.productForm?.resetForm();
  }
}