import {Provider, inject} from '@loopback/core';
import {RoleAuthorizerFn} from '../keys'; // Ensure correct import

export class RoleAuthorizationProvider implements Provider<RoleAuthorizerFn> {
  constructor() {}

  value(): RoleAuthorizerFn {
    return async (userRole: string | undefined, allowedRoles: string[]): Promise<boolean> => {
      if (!userRole) {
        console.warn('⚠️ User role is undefined, denying access.');
        return false;
      }

      console.log(`🔍 Checking Role: ${userRole} against Allowed Roles: ${allowedRoles}`);
      return allowedRoles.includes(userRole);
    };
  }
}
