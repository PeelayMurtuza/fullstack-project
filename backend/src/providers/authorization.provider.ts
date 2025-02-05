import {Provider} from '@loopback/core';
import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata,
} from '@loopback/authorization';

export class MyAuthorizationProvider implements Provider<(context: AuthorizationContext, metadata: AuthorizationMetadata) => Promise<AuthorizationDecision>> {
  constructor() {}

  value(): (context: AuthorizationContext, metadata: AuthorizationMetadata) => Promise<AuthorizationDecision> {
    return this.authorize.bind(this);
  }

  async authorize(
    authorizationCtx: AuthorizationContext,
    metadata: AuthorizationMetadata
  ): Promise<AuthorizationDecision> {
    const principal = authorizationCtx.principals?.[0];

    if (principal && principal.role === 'admin') {
      return AuthorizationDecision.ALLOW;
    }
    
    return AuthorizationDecision.DENY;
  }
}
