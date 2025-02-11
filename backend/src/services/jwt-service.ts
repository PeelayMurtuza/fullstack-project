import {inject} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {promisify} from 'util';
import {TokenServiceBindings} from '../keys';

const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

export class JWTService {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SECRET)
    private jwtSecret: string,

    @inject(TokenServiceBindings.TOKEN_EXPIRES_IN)
    private expiresSecret: string
  ) {
    if (!this.jwtSecret) {
      throw new HttpErrors.Unauthorized('JWT secret is missing. Please check your bindings.');
    }
    if (!this.expiresSecret) {
      throw new HttpErrors.Unauthorized('Token expiration time is missing. Please check your bindings.');
    }
  }

  async generateToken(userProfile: UserProfile): Promise<string> {
    if (!userProfile) {
      throw new HttpErrors.Unauthorized('User profile is null');
    }

    try {
      const tokenPayload = {
        [securityId]: userProfile[securityId] || userProfile.id,
        id: userProfile.id,
        name: userProfile.name,
        role: userProfile.role, // ✅ Ensure role is included
      };

      const token = await signAsync(tokenPayload, this.jwtSecret, {
        expiresIn: this.expiresSecret,
      });

      return token;
    } catch (err) {
      throw new HttpErrors.Unauthorized(`Error generating token: ${err.message}`);
    }
  }

  async verifyToken(token: string): Promise<UserProfile> {
    if (!token) {
      throw new HttpErrors.Unauthorized('Token is null');
    }

    try {
      const decryptedToken = await verifyAsync(token, this.jwtSecret);

      if (!decryptedToken.role) {
        throw new HttpErrors.Forbidden('Access denied: User role is missing');
      }

      const userProfile: UserProfile = {
        [securityId]: decryptedToken.id,
        id: decryptedToken.id,
        name: decryptedToken.name,
        role: decryptedToken.role, // ✅ Ensure role is returned
      };

      return userProfile;
    } catch (err) {
      throw new HttpErrors.Unauthorized(`Error verifying token: ${err.message}`);
    }
  }
}
