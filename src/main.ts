/*
  Application bootstrap entrypoint.
  - Calls `bootstrapApplication` with `App` and `appConfig`.
  Errors during bootstrap are logged to the console.
*/
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
