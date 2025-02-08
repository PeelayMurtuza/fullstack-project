import {Provider, inject} from '@loopback/core';
import {AuthenticationBindings} from '@loopback/authentication';
import {UserProfile} from '@loopback/security';

export class CurrentUserProvider implements Provider<UserProfile | null> {
  constructor(
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private readonly user: UserProfile | undefined, 
  ) {}

  value(): UserProfile | null {
    if (!this.user) {
      return null; // Ensure it doesn't break when the user is undefined
    }

    return {
      ...this.user, // Spread existing user properties
      roles: this.user.roles || [], // Ensure roles exist
    };
  }
}
