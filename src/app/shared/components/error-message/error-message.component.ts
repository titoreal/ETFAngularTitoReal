import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-message" *ngIf="message">
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <span class="error-text">{{ message }}</span>
        <button *ngIf="dismissible" class="close-btn" (click)="onDismiss()">&times;</button>
      </div>
    </div>
  `,
  styles: [`
    .error-message {
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
      background-color: #ffebee;
      border-left: 4px solid #f44336;
    }
    .error-content {
      display: flex;
      align-items: center;
    }
    .error-icon {
      margin-right: 10px;
      font-size: 1.2em;
    }
    .error-text {
      flex-grow: 1;
      color: #d32f2f;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 1.2em;
      cursor: pointer;
      color: #d32f2f;
    }
  `]
})
export class ErrorMessageComponent {
  @Input() message: string = '';
  @Input() dismissible: boolean = false;

  onDismiss() {
    this.message = '';
  }
}