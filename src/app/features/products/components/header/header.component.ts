import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="app-header">
      <div class="header-container">
        <h1 class="logo">Banco</h1>
        <nav class="nav-menu">
          <a routerLink="/" routerLinkActive="active">Productos</a>
          <a routerLink="/agregar" routerLinkActive="active">Agregar Producto</a>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      background-color: #003366;
      color: white;
      padding: 1rem 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header-container {
      width: 90%;
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      margin: 0;
      font-size: 1.5rem;
    }
    .nav-menu {
      display: flex;
      gap: 1.5rem;
    }
    .nav-menu a {
      color: white;
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 0;
      position: relative;
    }
    .nav-menu a.active {
      font-weight: bold;
    }
    .nav-menu a.active:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: white;
    }
  `]
})
export class HeaderComponent {}