import { injectable, BindingScope } from '@loopback/core';
import { repository } from '@loopback/repository';
import { UserRepository } from '../repositories';
import { User } from '../models';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { HttpErrors } from '@loopback/rest';

@injectable({ scope: BindingScope.TRANSIENT })
export class AuthService {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
  ) {}

  // Generate JWT Token
  async generateToken(user: User) {
    const secretKey = process.env.JWT_SECRET || 'your-secret-key';
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secretKey,
      { expiresIn: '1h' },
    );
  }

  // Verify Password
  async verifyPassword(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
  }

  // Decode JWT Token and get user details
  async getCurrentUser(token: string): Promise<User> {
    try {
      const secretKey = process.env.JWT_SECRET || 'your-secret-key';
      const decoded = jwt.verify(token, secretKey) as { id: number; email: string; role: string };

      // Find user from database
      const user = await this.userRepository.findById(decoded.id);
      if (!user) throw new HttpErrors.Unauthorized('User not found');

      return user;
    } catch (error) {
      throw new HttpErrors.Unauthorized('Invalid or expired token');
    }
  }
}
