import { AuthorizationContext, AuthorizationMetadata, AuthorizationDecision } from "@loopback/authorization";
import { UserProfile, securityId } from "@loopback/security";
import _ from "lodash";

export async function basicAuthorization(
  authorizationCtx: AuthorizationContext,
  metadata: AuthorizationMetadata,
): Promise<AuthorizationDecision> {
  let currentUser: UserProfile;
  if (authorizationCtx.principals.length > 0) {
    const user = _.pick(authorizationCtx.principals[0], ['id', 'name', 'role']);
    currentUser = { [securityId]: user.id, name: user.name, role: user.role };
  } else {
    return AuthorizationDecision.DENY;
  }
  if (!currentUser.role) {
    return AuthorizationDecision.DENY;
  }
  if (!metadata.allowedRoles) {
    return AuthorizationDecision.ALLOW;
  }
  if (metadata.allowedRoles.includes(currentUser.role)) {
    return AuthorizationDecision.ALLOW;
  }
  return AuthorizationDecision.DENY;
}
