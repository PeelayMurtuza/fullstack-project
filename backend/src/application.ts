import dotenv from 'dotenv';
dotenv.config(); // Load environment variables before anything else
import {AuthorizationComponent} from '@loopback/authorization';
import {AuthorizationBindings} from './keys';
import {ApplicationConfig} from '@loopback/core';
import {BootMixin} from '@loopback/boot';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import {JWTStrategy} from './authentication-stratgies/jwt-stratgies';
import {AuthenticationComponent, registerAuthenticationStrategy} from '@loopback/authentication';
import {SECURITY_SCHEME_SPEC, UserRepository} from '@loopback/authentication-jwt';
import {OPERATION_SECURITY_SPEC} from './utils/security-spec';
import path from 'path';
import {
  TokenServiceBindings,
} from './keys';
import {MySequence} from './sequence';
import {JWTService} from './services/jwt-service';
import {RestExplorerBindings, RestExplorerComponent} from '@loopback/rest-explorer';
import {Pizza} from './models/pizza.model';
import {User} from './models/user.model';
import {OrderRepository, PizzaRepository} from './repositories';
import {Order} from './models/order.model';

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

    // Register authentication & authorization components
    this.component(AuthenticationComponent);
    this.component(AuthorizationComponent); // Register Authorization Component
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
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN;

    if (!jwtSecret || !jwtExpiresIn) {
      throw new Error('JWT_SECRET or JWT_EXPIRES_IN is not defined in the environment variables.');
    }

    this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);
    this.bind(TokenServiceBindings.TOKEN_SECRET).to(jwtSecret);
    this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to(jwtExpiresIn);

    this.bind(AuthorizationBindings.CONFIG).toDynamicValue(() => ({
      allowAlwaysPaths: ['/explorer'],
    }));
    
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
