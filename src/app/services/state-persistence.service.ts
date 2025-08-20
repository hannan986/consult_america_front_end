import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StatePersistenceService {
  private readonly ROUTE_KEY = 'persisted_route';
  private readonly STATE_KEY = 'persisted_state';

  saveRoute(url: string) {
    localStorage.setItem(this.ROUTE_KEY, url);
  }

  getRoute(): string | null {
    return localStorage.getItem(this.ROUTE_KEY);
  }

  saveState(state: any) {
    localStorage.setItem(this.STATE_KEY, JSON.stringify(state));
  }

  getState(): any {
    const state = localStorage.getItem(this.STATE_KEY);
    return state ? JSON.parse(state) : null;
  }

  clear() {
    localStorage.removeItem(this.ROUTE_KEY);
    localStorage.removeItem(this.STATE_KEY);
  }
}
