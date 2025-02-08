import {inject} from '@loopback/core';
import {AuthenticationStrategy} from '@loopback/authentication';
import {TokenServiceBindings} from '../keys';
import {TokenService} from '@loopback/authentication';
import {Request, HttpErrors} from '@loopback/rest';
import {UserProfile} from '@loopback/security';

export class JWTStrategy implements AuthenticationStrategy {
  name = 'jwt';

  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public tokenService: TokenService,
  ) {}

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    const token = this.extractToken(request);

    if (!token) {
      throw new HttpErrors.Unauthorized('JWT token is missing');
    }

    const userProfile = await this.tokenService.verifyToken(token);

    if (!userProfile.roles) {
      throw new HttpErrors.Forbidden('User role is missing');
    }

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

    return parts[1]; // Return the extracted JWT token
  }
}
