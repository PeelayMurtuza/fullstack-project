import {
  AuthenticationBindings,
  AuthenticationMetadata,
} from '@loopback/authentication';
import {
  Getter,
  globalInterceptor,
  inject,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/context';
import {HttpErrors} from '@loopback/rest';
import {intersection} from 'lodash';
import {MyUserProfile, RequiredPermissions} from '../types';

/**
 * This class will be bound to the application as an `Interceptor` during
 * `boot`
 */
@globalInterceptor('', {tags: {name: 'authorize'}})
export class AuthorizeInterceptor implements Provider<Interceptor> {
  constructor(
    @inject(AuthenticationBindings.METADATA)
    public metadata: AuthenticationMetadata,

    // dependency inject
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    public getCurrentUser: Getter<MyUserProfile>,
  ) {}

  /**
   * This method is used by LoopBack context to produce an interceptor function
   * for the binding.
   *
   * @returns An interceptor function
   */
  value() {
    return this.intercept.bind(this);
  }

  /**
   * The logic to intercept an invocation
   * @param invocationCtx - Invocation context
   * @param next - A function to invoke next interceptor or the target method
   */
  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ) {
    try {
      // Check if metadata exists, otherwise continue
      if (!this.metadata || !this.metadata.options) return next();

      const requiredPermissions = this.metadata.options as RequiredPermissions;

      // Get the current user
      const user = await this.getCurrentUser();

      // Check if user has permissions array and it's defined
      if (!user || !user.permissions) {
        throw new HttpErrors.Unauthorized('User does not have permissions');
      }

      // Check if the user has the required permissions
      const hasPermission = intersection(
        user.permissions,
        requiredPermissions.required,
      ).length === requiredPermissions.required.length;

      if (!hasPermission) {
        throw new HttpErrors.Forbidden('Access denied due to missing permissions');
      }

      // Proceed with the request
      const result = await next();
      return result;
    } catch (err) {
      // Log error for debugging
      console.error('Authorization error:', err);
      throw err;
    }
  }
}
