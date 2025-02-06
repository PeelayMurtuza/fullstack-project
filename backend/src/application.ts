import {ApplicationConfig} from '@loopback/core';
import {BootMixin} from '@loopback/boot';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import {JWTStrategy} from './authentication-stratgies/jwt-stratgies';
import {AuthenticationComponent, registerAuthenticationStrategy} from '@loopback/authentication';
import {SECURITY_SCHEME_SPEC, UserRepository} from '@loopback/authentication-jwt';
import {OPERATION_SECURITY_SPEC} from './utils/security-spec'; // Import the newly defined security spec
import path from 'path';
import {PasswordHasherBindings, TokenServiceBindings, TokenServiceConstants, UserServiceBindings} from './keys';
import {MySequence} from './sequence';
import {BcryptHasher} from './services/hash.password';
import {JWTService} from './services/jwt-service';
import {MyUserService} from './services/user-service';
import { RestExplorerBindings, RestExplorerComponent } from '@loopback/rest-explorer';
import {AuthenticationBindings} from '@loopback/authentication';
import {CurrentUserProvider} from './services/current-user.provider';
import {Pizza} from './models/pizza.model';
import {User} from './models/user.model';
import { OrderRepository, PizzaRepository } from './repositories';
import { Order } from './models/order.model';
export {ApplicationConfig};

export class BackendApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(options: ApplicationConfig = {}) {
    super(options);
    
    this.model(Pizza);
    this.model(User);
    this.model(Order);

    this.repository(UserRepository);
    this.repository(OrderRepository);
    this.repository(PizzaRepository);
    // Setup bindings
    this.setupBindings();

    // Add security specification
    this.addSecuritySpec();

    // Register authentication component and strategy
    this.component(AuthenticationComponent);
    registerAuthenticationStrategy(this, JWTStrategy);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set default home page
    this.static('/', path.join(__dirname, '../public'));

    // Configure REST Explorer
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    // Set project root
    this.projectRoot = __dirname;

    // Customize Booter Conventions
    this.bootOptions = {
      controllers: {
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }

  setupBindings(): void {
    // Bind password hasher and rounds
    this.bind(PasswordHasherBindings.PASSWORD_HASHER).toClass(BcryptHasher);
    this.bind(PasswordHasherBindings.ROUNDS).to(10);

    // Bind user service
    this.bind(UserServiceBindings.USER_SERVICE).toClass(MyUserService);

    // Bind JWT service and configurations
    this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);
    this.bind(TokenServiceBindings.TOKEN_SECRET).to(TokenServiceConstants.TOKEN_SECRET_VALUE);
    this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to(TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE);
    this.component(AuthenticationComponent);
    this.bind('providers.CurrentUser').toClass(CurrentUserProvider);
  }

  addSecuritySpec(): void {
    this.api({
      openapi: '3.0.0',
      info: {
        title: 'Pizza Selling API',
        version: '1.0.0',
      },
      paths: {},
      components: {securitySchemes: SECURITY_SCHEME_SPEC}, // Add security schemes
      security: OPERATION_SECURITY_SPEC, // Apply security to operations
      servers: [{url: '/'}],
    });
  }
}
