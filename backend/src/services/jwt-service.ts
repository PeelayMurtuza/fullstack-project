import {inject} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {promisify} from 'util';
import {TokenServiceBindings} from '../keys';
const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

export class JWTService {
  @inject(TokenServiceBindings.TOKEN_SECRET)
  public readonly jwtSecret: string;

  @inject(TokenServiceBindings.TOKEN_EXPIRES_IN)
  public readonly expiresSecret: string;

  async generateToken(userProfile: UserProfile): Promise<string> {
    if (!userProfile) {
      throw new HttpErrors.Unauthorized('User profile is null');
    }

    try {
      // Include role in the token payload
      const tokenPayload = {
        ...userProfile,
        role: userProfile.role,  // Ensure role is included in the token
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

      const userProfile: UserProfile = {
        [securityId]: decryptedToken.id,
        id: decryptedToken.id,
        name: decryptedToken.name,
        permissions: decryptedToken.permissions,
        role: decryptedToken.role,  // Include role from token
      };

      return userProfile;
    } catch (err) {
      throw new HttpErrors.Unauthorized(`Error verifying token: ${err.message}`);
    }
  }
}
