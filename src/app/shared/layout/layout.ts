import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Router, RouterModule, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, MatIconModule, MatButtonModule],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss']
})
export class Layout {
  sidebarOpen = true;
  dropdownOpen = false;
userRole: string | null = null;
  private routeSub: any;
  constructor(public authService: AuthService, private router: Router) {
    // Subscribe to router events and persist last route on navigation end
    this.routeSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((ev: any) => {
      try {
        const url = ev?.urlAfterRedirects || ev?.url || '/';
        localStorage.setItem('lastRoute', url);
      } catch (e) {
        // ignore storage errors
      }
    });
  }

  ngOnInit() {
    this.userRole = localStorage.getItem('userRole');
  }

  ngOnDestroy(): void {
    if (this.routeSub && typeof this.routeSub.unsubscribe === 'function') {
      this.routeSub.unsubscribe();
    }
  }


//   get userRole(): string | null {
//     console.log('user role = ',localStorage.getItem('userRole'))
//   return localStorage.getItem('userRole');
// }
  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
    this.dropdownOpen = false; // Close dropdown when toggling sidebar
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/logout']);
  }
}