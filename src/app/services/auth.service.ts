import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { UserProfileModel } from '../models/userProfileModel'
import { environment } from '../../environments/environment.prod';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
 
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  private apiUrl = `${environment.apiBaseUrl}/api/auth`; // Update with your API URL
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    let userJson = null;
    
    //this.checkAuthState();
    if (this.isBrowser) {
      userJson = localStorage.getItem('currentUser');
    }

    this.currentUserSubject = new BehaviorSubject<any>(
      userJson ? JSON.parse(userJson) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  public isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

login(email: string, password: string): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/login`, { email, password }, { withCredentials: true })
    .pipe(map(user => {
      if (this.isBrowser) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        console.log("USER ROLE = ", user.role);
        localStorage.setItem('userRole', user.role);
        console.log('user role', localStorage.getItem('userRole'));
        localStorage.setItem('userEmail', user.email);
        console.log('user role', localStorage.getItem('userEmail'));
        localStorage.setItem('userId', user.userId);
        console.log('user role', localStorage.getItem('userId'));
      }
      this.currentUserSubject.next(user);
      return user;
    }));
}

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

 logout(): void {
  if (this.isBrowser) {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout failed:', err);
        // Still clear session client-side even if backend fails
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
      }
    });
  } else {
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
}
}
