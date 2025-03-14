import {UserService} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {PasswordHasherBindings} from '../keys'; // Removed RoleBindings import
import {User} from '../models';
import {UserRepository} from '../repositories/user.repository';
import {BcryptHasher} from './hash.password';

interface Credentials {
  email: string;
  password: string;
}

export class MyUserService implements UserService<User, Credentials> {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,

    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public hasher: BcryptHasher,
  ) {}

  async verifyCredentials(credentials: Credentials): Promise<User> {
    if (!credentials.email || !credentials.password) {
      throw new HttpErrors.BadRequest('Missing email or password');
    }

    const foundUser = await this.userRepository.findOne({
      where: {email: credentials.email},
    });

    if (!foundUser) {
      throw new HttpErrors.NotFound('User not found');
    }

    const passwordMatched = await this.hasher.comparePassword(
      credentials.password,
      foundUser.password,
    );

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized('Invalid password');
    }

    return foundUser;
  }

  convertToUserProfile(user: User): UserProfile {
    return {
      [securityId]: user.id!.toString(),
      id: user.id,
      email: user.email,
      role: user.role, // ✅ Use the role from the user model
    };
  }
}
