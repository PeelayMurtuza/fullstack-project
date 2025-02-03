import {injectable, BindingScope} from '@loopback/core';
import {repository} from '@loopback/repository';
import {UserRepository} from '../repositories';
import {User} from '../models';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

@injectable({scope: BindingScope.TRANSIENT})
export class AuthService {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  async generateToken(user: User) {
    const secretKey = process.env.JWT_SECRET || 'your-secret-key';
    return jwt.sign(
      {id: user.id, email: user.email, role: user.role},
      secretKey,
      {expiresIn: '1h'},
    );
  }

  async verifyPassword(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
  }
}
