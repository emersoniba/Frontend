import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private readonly router: Router,
    private readonly dialog: MatDialog
  ) { }

  canActivate(): boolean {
    const token = localStorage.getItem('tkn-boletas');

    if (token) {
      return true;
    } else {
      this.dialog.closeAll();
      this.router.navigate(['/login']);
      this.dialog.closeAll();
      return false;
    }
  }
}