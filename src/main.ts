import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { Router } from '@angular/router';

bootstrapApplication(App, appConfig)
  .then(platformRef => {
    // after bootstrap, attempt to navigate to last route if present
    try {
      const last = localStorage.getItem('lastRoute');
      if (last) {
        const injector = (platformRef as any).injector || (platformRef as any).get ? platformRef : null;
        // Try to obtain the Router and navigate
        const router = (platformRef as any).injector?.get?.(Router) || (platformRef as any).get?.(Router);
        if (router) {
          router.navigateByUrl(last).catch(() => {});
        }
      }
    } catch (e) {
      // ignore
    }
  })
  .catch((err) => console.error(err));
