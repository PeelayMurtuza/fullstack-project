import {injectable} from '@loopback/core';
import {User} from '../models';
import * as jwt from 'jsonwebtoken';
import {HttpErrors} from '@loopback/rest';

@injectable()
export class JwtService {
  constructor() {}

  // Generate JWT token
  async generateToken(user: User): Promise<string> {
    const secretKey = process.env.JWT_SECRET;  // Directly access the environment variable
    if (!secretKey) {
      throw new Error('JWT secret is not defined in environment variables');  // Error if it's not defined
    }

    const payload = {id: user.id, email: user.email, role: user.role};
    
    // Sign and return the token
    return jwt.sign(payload, secretKey, {expiresIn: '1h'});  // Token expiration set to 1 hour
  }

  // Verify JWT token and return user data
  async verifyToken(token: string): Promise<User> {
    const secretKey = process.env.JWT_SECRET;  // Directly access the environment variable
    if (!secretKey) {
      throw new Error('JWT secret is not defined in environment variables');  // Error if it's not defined
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, secretKey) as {id: number; email: string; role: string};
      
      // Return the decoded user data
      return {id: decoded.id, email: decoded.email, role: decoded.role} as User;
    } catch (error) {
      // Throw an Unauthorized error if token verification fails
      throw new HttpErrors.Unauthorized('Invalid or expired token');
    }
  }
}
