
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private roles: string[] = [];
  private rolesId: number[] = [];
  private fullName: string = '';

  constructor() { }

  setRoles(roles: string[]) {
    this.roles = roles;
  }

  getRoles(): string[] {
    return this.roles;
  }

  setRolesId(ids: number[]) {
    this.rolesId = ids;
  }

  getRolesId(): number[] {
    return this.rolesId;
  }

  setFullName(name: string) {
    this.fullName = name;
  }

  getFullName(): string {
    return this.fullName;
  }

  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }
  hasRoleId(rolId: number): boolean {
    return this.rolesId.includes(rolId);
  }
  hasAnyRole(roles: number[]): boolean {
    return roles.some(r => this.rolesId.includes(r));
  }

  clearAll() {
    this.roles = [];
    this.rolesId = [];
    this.fullName = '';
  }
}



