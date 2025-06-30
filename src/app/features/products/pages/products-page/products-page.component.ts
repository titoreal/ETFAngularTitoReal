import { Component } from '@angular/core';
import { ProductListComponent } from '../../components/product-list/product-list.component';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [ProductListComponent, HeaderComponent],
  templateUrl: './products-page.component.html',
  styleUrls: ['./products-page.component.scss']
})
export class ProductsPageComponent {}