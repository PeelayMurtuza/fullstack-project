import { UserProfile } from '@loopback/security';
import { UserRole } from '../src/models';

export interface MyUserProfile extends UserProfile {
  role: UserRole; // Now using role instead of permissions
  email?: string;
  name: string;
}

export const RolePermissions: Record<UserRole, string[]> = {
  [UserRole.USER]: ['USER'],
  [UserRole.ADMIN]: ['ADMIN'],
};
