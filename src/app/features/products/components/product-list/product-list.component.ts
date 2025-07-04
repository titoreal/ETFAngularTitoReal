import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { FinancialProductService } from '../../../../core/services/financial-product.service';
import { FinancialProduct } from '../../../../core/models/financial-product.model';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchPipe } from '../../../../shared/pipes/search/search.pipe';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchPipe,
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

  constructor(
    private productService: FinancialProductService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.error.set('');

    this.productService
      .getProducts()
      .pipe(
        catchError((error) => {
          this.error.set('Error al cargar los productos');
          return of([]);
        })
      )
      .subscribe((products) => {
        this.products.set(products);
        this.isLoading.set(false);
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
    this.activeMenuId.set(this.activeMenuId() === productId ? null : productId);
  }

  closeMenu(): void {
    this.activeMenuId.set(null);
  }

  editProduct(id: string): void {
    this.router.navigate(['/products/edit', id]);
  }

  openDeleteModal(product: FinancialProduct, event?: Event): void {
    console.log('🎯 [MODAL] === INICIO APERTURA MODAL ===');
    console.log('🎯 [MODAL] Producto:', product.id, product.name);

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.error.set('');
    console.log('🧹 [MODAL] Error limpiado');

    this.productToDelete = product;
    this.showDeleteModal = true;

    console.log('📋 [MODAL] Estado después de asignación:', {
      showDeleteModal: this.showDeleteModal,
      productToDelete: this.productToDelete?.id,
      hasError: !!this.error(),
    });

    this.activeMenuId.set(null);

    this.cd.detectChanges();
    console.log('🔄 [MODAL] Change detection ejecutada');

    setTimeout(() => {
      const modalExists = document.querySelector('.modal-overlay');
      console.log('🕐 [MODAL] Verificación DOM después de timeout:', {
        modalExists: !!modalExists,
        showDeleteModal: this.showDeleteModal,
      });

      if (modalExists) {
        const styles = getComputedStyle(modalExists);
        console.log('🎨 [MODAL] Estilos computados del modal:', {
          display: styles.display,
          visibility: styles.visibility,
          opacity: styles.opacity,
          zIndex: styles.zIndex,
          position: styles.position,
          top: styles.top,
          left: styles.left,
          width: styles.width,
          height: styles.height,
        });
      }
    }, 100);

    console.log('🎯 [MODAL] === FIN APERTURA MODAL ===');
  }

  closeDeleteModal(): void {
    console.log('❌ [MODAL] === INICIO CIERRE MODAL ===');
    this.showDeleteModal = false;
    this.productToDelete = null;
    this.error.set('');
    console.log('❌ [MODAL] Estado limpiado');
    console.log('❌ [MODAL] === FIN CIERRE MODAL ===');
  }

  confirmDelete(): void {
    console.log('⚡ [DELETE] === INICIO ELIMINACIÓN ===');
    console.log('⚡ [DELETE] Producto a eliminar:', this.productToDelete?.id);

    if (!this.productToDelete) {
      console.error('❌ [DELETE] No hay producto para eliminar');
      return;
    }

    // Limpiar error antes de iniciar eliminación
    this.error.set('');
    this.isLoading.set(true);

    console.log('🚀 [DELETE] Petición DELETE iniciada');

    this.productService.deleteProduct(this.productToDelete.id).subscribe({
      next: (response) => {
        console.log('✅ [DELETE] Eliminación exitosa:', response);
        this.closeDeleteModal();
        this.loadProducts();
        console.log('✅ [DELETE] Proceso completado exitosamente');
      },
      error: (err) => {
        console.error('💥 [DELETE] === ERROR EN ELIMINACIÓN ===');
        console.error('💥 [DELETE] Error completo:', err);
        console.error('💥 [DELETE] Status:', err.status);
        console.error('💥 [DELETE] StatusText:', err.statusText);
        console.error('💥 [DELETE] Error message:', err.error?.message);
        console.error('💥 [DELETE] URL:', err.url);

        // Determinar mensaje de error
        let errorMessage = 'Error desconocido al eliminar el producto';

        if (err.status === 0) {
          errorMessage = 'Error de conexión con el servidor';
        } else if (err.status === 404) {
          errorMessage = 'El producto no existe o ya fue eliminado';
        } else if (err.status === 500) {
          errorMessage = 'Error interno del servidor';
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        }

        this.error.set(errorMessage);
        this.isLoading.set(false);

        console.error('💥 [DELETE] Error establecido:', errorMessage);
        console.error('💥 [DELETE] Estado final:', {
          isLoading: this.isLoading(),
          hasError: !!this.error(),
          showModal: this.showDeleteModal,
          errorMessage: this.error(),
        });
        console.error('💥 [DELETE] === FIN ERROR EN ELIMINACIÓN ===');
      },
    });

    console.log('⚡ [DELETE] === FIN INICIO ELIMINACIÓN ===');
  }

  getPaginatedProducts(): FinancialProduct[] {
    const searchPipe = new SearchPipe();
    const filtered = searchPipe.transform(this.products(), this.searchTerm);
    return filtered.slice(0, this.itemsPerPage);
  }

  getFilteredCount(): number {
    const searchPipe = new SearchPipe();
    return searchPipe.transform(this.products(), this.searchTerm).length;
  }

  debugModal(): void {
    console.log('🐛 [DEBUG] Estado manual del modal:', {
      showDeleteModal: this.showDeleteModal,
      productToDelete: this.productToDelete,
      error: this.error(),
      isLoading: this.isLoading(),
    });

    const modalOverlay = document.querySelector('.modal-overlay');
    console.log('🐛 [DEBUG] Modal en DOM:', !!modalOverlay);

    if (modalOverlay) {
      console.log('🐛 [DEBUG] Estilos del modal:', {
        display: getComputedStyle(modalOverlay).display,
        visibility: getComputedStyle(modalOverlay).visibility,
        opacity: getComputedStyle(modalOverlay).opacity,
        zIndex: getComputedStyle(modalOverlay).zIndex,
      });
    }
  }
}
