import {repository} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
  response,
  HttpErrors,
} from '@loopback/rest';
import {Order} from '../models';
import {OrderRepository} from '../repositories';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {inject} from '@loopback/core';
import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {basicAuthorization} from '../interceptors/authorize.interceptor'; // Importing authorization interceptor
import {UserRole} from '../models/user.model'; // Ensure you have UserRole defined

export class OrderUserController {
  constructor(
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
  ) {}

  @get('/users/{userId}/orders')
  @authenticate('jwt') // Require authentication
  @authorize({
    allowedRoles: [UserRole.ADMIN, UserRole.USER], 
    voters: [basicAuthorization], // Apply custom authorization logic
  })
  @response(200, {
    description: 'Array of Orders placed by the user',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Order, {includeRelations: true}),
        },
      },
    },
  })
  async findOrdersByUserId(
    @param.path.number('userId') userId: number,
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<Order[]> {
    const currentUserId = currentUserProfile.id;

    // Allow only admins or the order owner to access orders
    if (currentUserId !== userId && !this.isAdmin(currentUserProfile)) {
      throw new HttpErrors.Forbidden('Unauthorized access');
    }

    return this.orderRepository.find({
      where: {userId: userId}, // Filter orders by userId
    });
  }

  @get('/users/{userId}/orders/{orderId}')
  @authenticate('jwt') // Require authentication
  @authorize({
    allowedRoles: [UserRole.ADMIN, UserRole.USER], 
    voters: [basicAuthorization], // Apply custom authorization logic
  })
  @response(200, {
    description: 'Order by user with specific orderId',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Order, {includeRelations: true}),
      },
    },
  })
  async findOrderById(
    @param.path.number('userId') userId: number,
    @param.path.number('orderId') orderId: number,
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<Order> {
    const currentUserId = currentUserProfile.id;

    // Allow only admins or the order owner to access their specific order
    if (currentUserId !== userId && !this.isAdmin(currentUserProfile)) {
      throw new HttpErrors.Forbidden('Unauthorized access');
    }

    const order = await this.orderRepository.findOne({
      where: {id: orderId, userId: userId}, // Find the order by ID for the specific user
    });

    if (!order) {
      throw new HttpErrors.NotFound('Order not found');
    }

    return order;
  }

  // Helper method to check if the current user is an admin
  private isAdmin(currentUserProfile: UserProfile): boolean {
    return currentUserProfile.role === UserRole.ADMIN;
  }
}
