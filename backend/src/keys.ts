import {BindingKey} from '@loopback/core';
import {TokenService, UserService} from '@loopback/authentication';
import {User} from './models';
import {PasswordHasher} from './services/hash.password';
import {Credentials} from '@loopback/authentication-jwt';

export namespace TokenServiceConstants {
  export const TOKEN_SECRET_VALUE = process.env.JWT_SECRET; 
  export const TOKEN_EXPIRES_IN_VALUE =process.env.JWT_EXPIRES_IN; 
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

export namespace RoleBindings {
  export const USER_ROLE = BindingKey.create<string>('authentication.user.role'); 
}
