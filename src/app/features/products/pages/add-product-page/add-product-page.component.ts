import { Component } from '@angular/core';
import { FinancialProduct } from '../../../../core/models/financial-product.model';
import { FinancialProductService } from '../../../../core/services/financial-product.service';
import { Router } from '@angular/router';
import { MessageService } from '../../../../core/services/message.service';
import { ProductFormComponent } from '../../components/product-form/product-form.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { CommonModule } from '@angular/common';

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
export class AddProductPageComponent {
  isLoading = false;
  errorMessage = '';

  constructor(
    private productService: FinancialProductService,
    private router: Router,
    private messageService: MessageService
  ) {}

  onSubmit(product: FinancialProduct): void {
  
    this.isLoading = true;
    this.errorMessage = '';
    this.productService.createProduct(product).subscribe({
      next: () => {
        this.messageService.showSuccess('Producto creado exitosamente');
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.errorMessage = 'Error al crear el producto';
        this.isLoading = false;
      },
    });
  }
}
