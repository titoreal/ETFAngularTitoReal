import { FinancialProductService } from '../services/financial-product.service';
import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { map, catchError, of } from 'rxjs';

export const customValidators = {
  idExistsValidator(productService: FinancialProductService): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) {
        return of(null);
      }
      return productService.verifyId(control.value).pipe(
        map(exists => exists ? { idExists: true } : null),
        catchError(() => of(null))
      );
    };
  }
};