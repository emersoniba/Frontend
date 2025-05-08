import { ApplicationConfig,importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { routes } from './app.routes';

import { AuthGuard } from './guards/auth.guard'; 

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideHttpClient(),
    provideRouter(routes),
    importProvidersFrom(
      //FormsModule,
      //ReactiveFormsModule,
      //aqui
    ),
    AuthGuard 
  ]
};

