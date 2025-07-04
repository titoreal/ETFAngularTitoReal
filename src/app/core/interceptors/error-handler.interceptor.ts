import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, throwError, tap,  } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, } from '../services/message.service';
import { HttpResponse } from '@angular/common/http';


export const errorHandlerInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  const messageService = inject(MessageService);

  if (isDeleteProductRequest(request)) {
    return handleDeleteRequest(request, next, router, messageService);
  }

  return next(request).pipe(
    tap((response) => logSuccessResponse(response)),
    catchError((error: HttpErrorResponse) =>
      handleError(error, router, messageService)
    )
  );
};

function isDeleteProductRequest(request: HttpRequest<unknown>): boolean {
  return request.method === 'DELETE' && request.url.includes('/bp/products/');
}

function handleDeleteRequest(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  router: Router,
  messageService: MessageService
): Observable<HttpEvent<unknown>> {
  return next(request).pipe(
    tap((response) => logSuccessResponse(response)),
    catchError((error: HttpErrorResponse) => {
      console.warn('[HTTP] Error en DELETE, delegado al componente', error);
      return throwError(() => error);
    })
  );
}

function logSuccessResponse(response: any): void {
  if (response instanceof HttpResponse) {
    console.log('✅ Interceptor - Respuesta exitosa:', response);
  }
}

function handleError(
  error: HttpErrorResponse,
  router: Router,
  messageService: MessageService
): Observable<never> {
  console.error('❌ Interceptor - Error capturado:', error);

  let errorMessage = 'Ocurrió un error inesperado';

  if (error.error instanceof ErrorEvent) {
    errorMessage = `Error: ${error.error.message}`;
  } else {
    switch (error.status) {
      case 400:
        errorMessage = error.error?.message || 'Solicitud incorrecta';
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
      default:
        errorMessage = `Error ${error.status}: ${error.statusText}`;
    }
  }

  messageService.showError(errorMessage);
  return throwError(() => new Error(errorMessage));
}