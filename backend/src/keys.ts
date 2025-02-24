import {BindingKey} from '@loopback/core';
import {AuthorizationMetadata} from '@loopback/authorization';
import {TokenService, UserService} from '@loopback/authentication';
import {User} from './models';
import {PasswordHasher} from './services/hash.password';
import {Credentials} from '@loopback/authentication-jwt';
import {Provider} from '@loopback/core';

// Role-Based Authorization Provider
export type RoleAuthorizerFn = (userRole: string, allowedRoles: string[]) => Promise<boolean>;

export namespace TokenServiceConstants {
  export const TOKEN_SECRET_VALUE = process.env.JWT_SECRET || 'default-secret-key';
  export const TOKEN_EXPIRES_IN_VALUE = process.env.JWT_EXPIRES_IN || '3600';
}

export namespace TokenServiceBindings {
  export const TOKEN_SECRET = BindingKey.create<string>('authentication.jwt.secret');
  export const TOKEN_EXPIRES_IN = BindingKey.create<string>('authentication.jwt.expiresIn');
  export const TOKEN_SERVICE = BindingKey.create<TokenService>('services.jwt.service');
}

export namespace PasswordHasherBindings {
  export const PASSWORD_HASHER = BindingKey.create<PasswordHasher>('services.hasher');
  export const ROUNDS = BindingKey.create<number>('services.hasher.rounds');
}

export namespace UserServiceBindings {
  export const USER_SERVICE = BindingKey.create<UserService<Credentials, User>>('services.user.service');
}

// Role-Based Authorization Bindings
export namespace AuthorizationBindings {
  export const AUTHORIZER = BindingKey.create<Provider<RoleAuthorizerFn>>('authorization.role.authorizer');
  export const METADATA = BindingKey.create<AuthorizationMetadata | undefined>('authorization.metadata');
  export const CONFIG = BindingKey.create<object>('authorization.config'); 
}

export namespace RoleBindings {
  export const ROLE_AUTHORIZER = BindingKey.create<Provider<RoleAuthorizerFn>>('authorization.role.authorizer');
}
