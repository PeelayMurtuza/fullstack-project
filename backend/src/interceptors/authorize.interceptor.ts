import {Provider, inject, Setter} from '@loopback/core';
import {AuthorizationContext, AuthorizationDecision, AuthorizationMetadata, Authorizer} from '@loopback/authorization';
import {AuthenticationBindings} from '@loopback/authentication';
import {UserProfile} from '@loopback/security';

export class RoleAuthorizationProvider implements Provider<Authorizer> {
  constructor(
    @inject.setter(AuthenticationBindings.CURRENT_USER)
    private readonly getCurrentUser: Setter<UserProfile>,
  ) {}

  value(): Authorizer {
    return async (context: AuthorizationContext, metadata: AuthorizationMetadata) => {
      const user = await context.invocationContext.get<UserProfile | undefined>(AuthenticationBindings.CURRENT_USER);
      if (!user) {
        return AuthorizationDecision.DENY;
      }

      //Check if required roles exist in metadata
      if (!metadata.allowedRoles || metadata.allowedRoles.length === 0) {
        return AuthorizationDecision.ALLOW;
      }

      //Compare user role with allowed roles
      if (metadata.allowedRoles.includes(user.role)) {
        return AuthorizationDecision.ALLOW;
      }

      return AuthorizationDecision.DENY;
    };
  }
}
