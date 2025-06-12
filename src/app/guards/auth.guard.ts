import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';


export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const dialog = inject(MatDialog);
  const router = inject(Router);
  const token = localStorage.getItem('tkn-boletas');

  if (token) {
    return true;
  } else {
    dialog.closeAll();
    router.navigate(['/login']);
    dialog.closeAll();
    return false;
  }
};
