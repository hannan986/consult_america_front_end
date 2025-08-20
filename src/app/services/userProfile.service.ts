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
export class UserProfileService {
private apiUrl = `${environment.apiBaseUrl}/user-profile`;

  constructor(private http: HttpClient) {}

getUserProfile(email: string): Observable<UserProfileModel> {
  return this.http.get<UserProfileModel>(`${this.apiUrl}/${email}`);
}

updateUserProfile(profile: UserProfileModel): Observable<any> {
  return this.http.put(`${this.apiUrl}/${profile.email}`, profile);
}
}