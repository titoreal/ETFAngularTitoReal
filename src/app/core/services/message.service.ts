import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private errorSubject = new BehaviorSubject<string>('');
  private successSubject = new BehaviorSubject<string>('');
  
  error$ = this.errorSubject.asObservable();
  success$ = this.successSubject.asObservable();

  showError(message: string): void {
    this.errorSubject.next(message);
  }

  showSuccess(message: string): void {
    this.successSubject.next(message);
   
    setTimeout(() => this.clearSuccess(), 5000);
  }

  clearError(): void {
    this.errorSubject.next('');
  }

  clearSuccess(): void {
    this.successSubject.next('');
  }

  clearAll(): void {
    this.clearError();
    this.clearSuccess();
  }
}