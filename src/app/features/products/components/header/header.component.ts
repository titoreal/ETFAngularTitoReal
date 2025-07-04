import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  path: string;
  label: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  readonly appName = 'Banco';
  readonly navItems: NavItem[] = [
    { path: '/', label: 'Productos' },
    { path: '/agregar', label: 'Agregar Producto' }
  ];
}