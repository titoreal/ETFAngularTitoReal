import { Component, OnInit } from '@angular/core';
import { FinancialProduct } from '../../../../core/models/financial-product.model';
import { FinancialProductService } from '../../../../core/services/financial-product.service';
import { MessageService } from '../../../../core/services/message.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductFormComponent } from '../../components/product-form/product-form.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

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
export class EditProductPageComponent implements OnInit {
  product: FinancialProduct | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private productService: FinancialProductService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
    } else {
      this.errorMessage = 'ID de producto no proporcionado';
    }
  }

  loadProduct(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.productService.getProducts().subscribe({
      next: (products) => {
        const foundProduct = products.find(p => p.id === id);
        if (foundProduct) {
          this.product = { ...foundProduct };
        } else {
          this.errorMessage = 'Producto no encontrado';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar el producto';
        this.isLoading = false;
      }
    });
  }

  onSubmit(updatedProduct: FinancialProduct): void {
    if (!this.product) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.productService.updateProduct(this.product.id, updatedProduct).subscribe({
      next: () => {
        this.messageService.showSuccess('Producto actualizado exitosamente');
        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.errorMessage = 'Error al actualizar el producto';
        this.isLoading = false;
      }
    });
  }
}