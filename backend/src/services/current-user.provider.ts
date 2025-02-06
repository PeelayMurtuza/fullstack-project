import {Provider, inject} from '@loopback/core';
import {AuthenticationBindings} from '@loopback/authentication';
import {UserProfile} from '@loopback/security';

export class CurrentUserProvider implements Provider<UserProfile> {
  constructor(
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private readonly user: UserProfile , 
  ) {}

  value(): UserProfile {
    return this.user; 
  }
}
