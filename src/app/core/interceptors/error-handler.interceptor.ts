import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpResponse
} from '@angular/common/http';
import { Observable, catchError, throwError, tap } from 'rxjs';
import { Router } from '@angular/router';
import { MessageService } from '../services/message.service';

export const errorHandlerInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  const messageService = inject(MessageService);

  console.log('🚀 Interceptor - Petición:', request.url);

  return next(request).pipe(
    tap(response => {
      if (response instanceof HttpResponse) {
        console.log('✅ Interceptor - Respuesta exitosa:', response);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      console.log('❌ Interceptor - Error capturado:', error);
      
      let errorMessage = 'Ocurrió un error inesperado';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error: ${error.error.message}`;
      } else {
        switch (error.status) {
          case 400:
            errorMessage = error.error.message || 'Solicitud incorrecta';
            break;
          case 401:
            errorMessage = 'No autorizado';
            router.navigate(['/']);
            break;
          case 404:
            errorMessage = 'Recurso no encontrado';
            break;
          case 500:
            errorMessage = 'Error interno del servidor';
            break;
        }
      }

      console.log('💥 Error procesado:', errorMessage);
      messageService.showError(errorMessage);
      return throwError(() => new Error(errorMessage));
    })
  );
};