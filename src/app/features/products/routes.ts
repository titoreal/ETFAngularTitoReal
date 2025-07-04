import { Routes } from '@angular/router';
import { ProductListComponent } from '../products/components/product-list/product-list.component';
import { AddProductPageComponent } from '../products/pages/add-product-page/add-product-page.component';
import { EditProductPageComponent } from '../products/pages/edit-product-page/edit-product-page.component';

export const APP_ROUTES = {
  PRODUCTS: 'products',
  ADD_PRODUCT: 'products/add',
  EDIT_PRODUCT: 'products/edit'
} as const;

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: APP_ROUTES.PRODUCTS },
  { path: APP_ROUTES.PRODUCTS, component: ProductListComponent },
  { path: APP_ROUTES.ADD_PRODUCT, component: AddProductPageComponent },
  { 
    path: `${APP_ROUTES.EDIT_PRODUCT}/:id`, 
    component: EditProductPageComponent 
  },
  { path: '**', redirectTo: APP_ROUTES.PRODUCTS }
];