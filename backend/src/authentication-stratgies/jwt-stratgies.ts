import {AuthenticationStrategy} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {Request} from 'express';
import {TokenServiceBindings} from '../keys';
import {JWTService} from '../services/jwt-service';

export class JWTStrategy implements AuthenticationStrategy {
  name = 'jwt';

  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: JWTService,
  ) {}

  async authenticate(request: Request): Promise<UserProfile> {
    const token: string = this.extractCredentials(request);
    const userProfile = await this.jwtService.verifyToken(token);

    // Ensure role information is passed correctly
    if (!userProfile || !userProfile.role) {
      throw new HttpErrors.Unauthorized('User role missing in token');
    }

    return userProfile;
  }

  extractCredentials(request: Request): string {
    const authHeaderValue = request.headers.authorization;
    if (!authHeaderValue) {
      throw new HttpErrors.Unauthorized('Authorization header is missing');
    }

    // Expected format: Bearer <token>
    const parts = authHeaderValue.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new HttpErrors.Unauthorized(
        "Authorization header format must be 'Bearer <token>'",
      );
    }

    return parts[1]; // Return the JWT token
  }
}
