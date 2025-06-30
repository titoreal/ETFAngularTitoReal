import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './features/products/routes';
import { provideHttpClient, withInterceptors, withJsonpSupport } from '@angular/common/http';
import { errorHandlerInterceptor } from './core/interceptors/error-handler.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([errorHandlerInterceptor]),
      withJsonpSupport()
    )
  ]
};
