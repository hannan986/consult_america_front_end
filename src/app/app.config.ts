import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
// In your main.ts or app.config.ts
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),provideHttpClient(),]
};