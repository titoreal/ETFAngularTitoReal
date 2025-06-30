import { Component, OnInit, signal, computed } from '@angular/core';
import { FinancialProductService } from '../../../../core/services/financial-product.service';
import { FinancialProduct } from '../../../../core/models/financial-product.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchPipe } from '../../../../shared/pipes/search/search.pipe';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { Router,RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingComponent,
    ErrorMessageComponent,
    RouterLink,
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit {
  
  searchTerm = '';
  itemsPerPage = 5;
  
 
  activeMenuId = signal<string | null>(null);

 
  products = signal<FinancialProduct[]>([]);
  isLoading = signal(false);
  error = signal('');
  showDeleteModal = false;
  productToDelete: FinancialProduct | null = null;


  filteredProducts = computed(() => {
    return this.products().filter(
      (p) =>
        p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  });

  paginatedProducts = computed(() => {
    return this.filteredProducts().slice(0, this.itemsPerPage);
  });

   constructor(
    private productService: FinancialProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();

    document.addEventListener('click', () => {
      this.activeMenuId.set(null);
    });
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.error.set('');

    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products.set(Array.isArray(products) ? products : []);
      },
      error: (err) => {
        this.error.set('No se encontraron productos');
        this.products.set([]);
      },
      complete: () => this.isLoading.set(false),
    });
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/default-product.png';
    img.onerror = null;
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
  }

  onItemsPerPageChange(count: number): void {
    this.itemsPerPage = count;
  }

  toggleMenu(productId: string, event: Event): void {
    event.stopPropagation();
    this.activeMenuId.set(
      this.activeMenuId() === productId ? null : productId
    );
  }

  closeMenu(): void {
    this.activeMenuId.set(null);
  }

  editProduct(id: string): void {
    this.router.navigate(['/products/edit', id]);
    // Navegar a editar
  }

  openDeleteModal(product: FinancialProduct): void {
    this.productToDelete = product;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.productToDelete = null;
  }

  confirmDelete(): void {
    if (!this.productToDelete) return;

    this.isLoading.set(true);
    this.productService.deleteProduct(this.productToDelete.id).subscribe({
      next: () => {
        this.loadProducts();
        this.closeDeleteModal();
      },
      error: (err) => {
        this.error.set('Error al eliminar el producto');
        this.isLoading.set(false);
        this.closeDeleteModal();
      }
    });
  }
}
