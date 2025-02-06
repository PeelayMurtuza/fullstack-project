import { repository } from '@loopback/repository';
import { UserRepository } from '../repositories';
import { User, UserRole } from '../models';
import { post, requestBody, HttpErrors } from '@loopback/rest';
import * as bcrypt from 'bcryptjs';
import { JWTService } from '../services/jwt-service';
import { service } from '@loopback/core';
import { UserProfile, securityId } from '@loopback/security';

export class AuthController {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @service(JWTService) public jwtService: JWTService,
  ) {}

  // SignUp - Register a new user with role assignment
  @post('/signup')
  async signUp(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['email', 'password', 'role'],
            properties: {
              email: { type: 'string' },
              password: { type: 'string' },
              role: {
                type: 'string',
                enum: Object.values(UserRole), // Ensuring enum values
              },
            },
          },
        },
      },
    })
    newUser: Omit<User, 'id'>,
  ) {
    const existingUser = await this.userRepository.findOne({ where: { email: newUser.email } });
    if (existingUser) throw new HttpErrors.Conflict('Email already in use');

    // Hash password before saving
    newUser.password = await bcrypt.hash(newUser.password, 10);

    // Default role to 'user' if not provided
    newUser.role = newUser.role || UserRole.USER;

    // Save new user to the database
    const createdUser = await this.userRepository.create(newUser);
    return createdUser;
  }

  // Login - Authenticate user and return JWT token with role
  @post('/login')
  async login(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
              email: { type: 'string' },
              password: { type: 'string' },
            },
          },
        },
      },
    })
    credentials: { email: string; password: string },
  ) {
    // Find user by email
    const user = await this.userRepository.findOne({ where: { email: credentials.email } });
    if (!user) throw new HttpErrors.Unauthorized('Invalid email or password');

    // Verify password
    const passwordMatches = await bcrypt.compare(credentials.password, user.password);
    if (!passwordMatches) throw new HttpErrors.Unauthorized('Invalid email or password');

    // Check if user.id and user.name are defined before accessing them
    if (!user.id ) {
      throw new HttpErrors.Unauthorized('User data is incomplete');
    }

    // Manually create a UserProfile object, adding the missing securityId
    const userProfile: UserProfile = {
      [securityId]: user.id.toString(),

      id: user.id.toString(),
      role: user.role,
      email: user.email,
    };

    // Generate and return JWT token with role
    const token = await this.jwtService.generateToken(userProfile);
    return { token, role: user.role, isAdmin: user.role === UserRole.ADMIN };
  }
}
