/*
  Application configuration.
  - Provides global error listeners and the router with the app routes.
  Keep this file minimal; important for `bootstrapApplication`.
*/
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};
