import {UserProfile} from '@loopback/security';
import {PermissionKeys} from './authorization/permission-keys';

export interface RequiredPermissions {
  required: PermissionKeys[];
}

export interface MyUserProfile extends UserProfile {
  permissions: PermissionKeys[];
  email?: string;
  name: string;  
}
