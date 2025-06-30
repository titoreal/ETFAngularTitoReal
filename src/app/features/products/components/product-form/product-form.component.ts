import { Component, OnInit, inject, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FinancialProduct } from '../../../../core/models/financial-product.model';
import { FinancialProductService } from '../../../../core/services/financial-product.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, ErrorMessageComponent],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  private productService = inject(FinancialProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  @Input() initialProduct: FinancialProduct = {
    id: '',
    name: '',
    description: '',
    logo: '',
    date_release: '',
    date_revision: ''
  };

  @Input() isEditMode = false;
  @Output() formSubmitted = new EventEmitter<FinancialProduct>();

  @ViewChild('productForm') productForm?: NgForm;
  
  product: FinancialProduct = { ...this.initialProduct };
  formSubmittedFlag = false;
  isLoading = false;
  error = '';
  minDate = new Date().toISOString().split('T')[0];
  idExists = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && !this.initialProduct.id) {
      this.loadProduct(id);
    }
    
    if (this.isEditMode && this.productForm?.controls['id']) {
      this.productForm.controls['id'].disable();
    }
  }

  loadProduct(id: string): void {
    this.isLoading = true;
    this.error = '';
    this.productService.getProducts().subscribe({
      next: (products) => {
        const foundProduct = products.find(p => p.id === id);
        if (foundProduct) {
          this.product = { ...foundProduct };
        } else {
          this.error = 'Producto no encontrado';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar el producto';
        this.isLoading = false;
      }
    });
  }

  updateRevisionDate(): void {
    if (this.product.date_release) {
      const releaseDate = new Date(this.product.date_release);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (releaseDate < today && this.productForm?.controls['date_release']) {
        this.productForm.controls['date_release'].setErrors({ minDate: true });
        return;
      }

      releaseDate.setFullYear(releaseDate.getFullYear() + 1);
      this.product.date_revision = releaseDate.toISOString().split('T')[0];
      
      if (this.productForm?.controls['date_revision']) {
        this.productForm.controls['date_revision'].updateValueAndValidity();
      }
    }
  }

  validateId(idControl: NgModel): void {
    if (!this.isEditMode && idControl.value && idControl.value.length >= 3) {
      this.productService.verifyId(idControl.value).subscribe({
        next: (exists) => {
          this.idExists = exists;
          if (exists) {
            idControl.control?.setErrors({ idExists: true });
          } else {
            idControl.control?.setErrors(null);
          }
        },
        error: () => {
          idControl.control?.setErrors({ serverError: true });
        }
      });
    }
  }

  onSubmit(): void {
    this.formSubmittedFlag = true;
    this.updateRevisionDate();

    if (!this.productForm?.valid) {
      return;
    }

    this.isLoading = true;
    this.error = '';

    if (this.formSubmitted.observed) {
      this.formSubmitted.emit(this.product);
    } else {
      const operation = this.isEditMode
        ? this.productService.updateProduct(this.product.id, this.product)
        : this.productService.createProduct(this.product);

      operation.subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.error = this.isEditMode
            ? 'Error al actualizar el producto'
            : 'Error al crear el producto';
          this.isLoading = false;
        }
      });
    }
  }

  resetForm(): void {
    if (this.isEditMode && this.product.id) {
      this.loadProduct(this.product.id);
    } else {
      this.product = { ...this.initialProduct };
      this.formSubmittedFlag = false;
      this.productForm?.resetForm();
    }
    this.error = '';
  }
}