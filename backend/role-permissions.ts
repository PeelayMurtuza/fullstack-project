import { UserRole } from './src/models';

export const RolePermissions: Record<UserRole, string[]> = {
  [UserRole.USER]: ['USER'],
  [UserRole.ADMIN]: ['ADMIN'],
};
