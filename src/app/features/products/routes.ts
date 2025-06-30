import { Routes } from '@angular/router';
import { ProductListComponent } from '../products/components/product-list/product-list.component'
import { AddProductPageComponent } from '../products/pages/add-product-page/add-product-page.component'
import { EditProductPageComponent } from '../products/pages/edit-product-page/edit-product-page.component'

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'products' },
  { path: 'products', component: ProductListComponent },
  { path: 'products/add', component: AddProductPageComponent },
  { path: 'products/edit/:id', component: EditProductPageComponent },
  { path: '**', redirectTo: 'products' }
];