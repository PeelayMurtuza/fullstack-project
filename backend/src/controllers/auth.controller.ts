import { repository } from '@loopback/repository';
import { UserRepository } from '../repositories';
import { User, UserRole } from '../models';
import { post, requestBody, HttpErrors } from '@loopback/rest';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '../services/jwt-service.service';
import { service } from '@loopback/core';

export class AuthController {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @service(JwtService) public jwtService: JwtService,
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
    return this.userRepository.create(newUser);
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

    // Generate and return JWT token with role
    const token = await this.jwtService.generateToken(user);
    return { token, role: user.role, isAdmin: user.role === UserRole.ADMIN };
  }
}
