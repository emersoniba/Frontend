import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';

import { AuthGuard } from './guards/auth.guard';
import { tokenInterceptor } from './interceptors/token.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
	providers: [
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideHttpClient(
			withInterceptors([tokenInterceptor,])
		),
		provideRouter(routes, withHashLocation()),
		importProvidersFrom(),
		AuthGuard,
		importProvidersFrom(BrowserModule, HttpClientModule),
		provideAnimations()
	]
};

