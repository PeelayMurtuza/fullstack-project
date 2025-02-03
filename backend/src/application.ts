import { BootMixin } from '@loopback/boot';
import { ApplicationConfig } from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import { RepositoryMixin } from '@loopback/repository';
import { RestApplication } from '@loopback/rest';
import { ServiceMixin } from '@loopback/service-proxy';
import path from 'path';
import { MySequence } from './sequence';
import { JwtService } from './services/jwt-service.service';
import {AuthorizationComponent, AuthorizationBindings} from '@loopback/authorization';
import {AuthorizationOptions, AuthorizationDecision} from '@loopback/authorization';
import * as dotenv from 'dotenv';
dotenv.config();

export { ApplicationConfig };

export class BackendApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
    //authentication JWT binding 
    this.bind('services.JwtService').toClass(JwtService);

     // Register the Authorization Component
     this.component(AuthorizationComponent);

     // Configure authorization options (Optional)
     const authorizationOptions: AuthorizationOptions = {
       precedence: AuthorizationDecision.DENY, // The order in which to evaluate authorization policies
       defaultDecision: AuthorizationDecision.DENY, // Default decision when no policy matches
     };
 
     // Apply the configuration
     this.configure(AuthorizationBindings.COMPONENT).to(authorizationOptions);
}
}