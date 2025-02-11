import {inject} from '@loopback/core';
import {AuthenticationStrategy} from '@loopback/authentication';
import {TokenServiceBindings} from '../keys';
import {TokenService} from '@loopback/authentication';
import {Request, HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';

export class JWTStrategy implements AuthenticationStrategy {
  name = 'jwt';

  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public tokenService: TokenService,
  ) {}

  async authenticate(request: Request): Promise<UserProfile> {
    const token = this.extractToken(request);

    if (!token) {
      throw new HttpErrors.Unauthorized('JWT token is missing');
    }

    const userProfile = await this.tokenService.verifyToken(token);

    if (!userProfile.role) {
      throw new HttpErrors.Forbidden('Access denied: No role provided in token');
    }

    // Ensure roles are stored as an array
    userProfile.roles = Array.isArray(userProfile.role) ? userProfile.role : [userProfile.role];

    return userProfile;
  }

  extractToken(request: Request): string {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new HttpErrors.Unauthorized('Authorization header is missing');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      throw new HttpErrors.Unauthorized('Authorization header must be in the format: Bearer <token>');
    }

    return parts[1]; // Extract JWT token
  }
}
