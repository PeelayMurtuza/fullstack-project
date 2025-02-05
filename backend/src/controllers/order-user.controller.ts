import {repository} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
  response,
} from '@loopback/rest';
import {Order} from '../models';
import {OrderRepository} from '../repositories';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {inject} from '@loopback/core';  // Corrected import for inject
import {authenticate} from '@loopback/authentication'; // Corrected import for authenticate

export class OrderUserController {
  constructor(
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
  ) {}

  @get('/users/{userId}/orders')
  @authenticate('jwt') // Require authentication
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
    @param.path.number('userId') userId: number, // UserID from URL
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile, // Current user data from JWT
  ): Promise<Order[]> {
    const currentUserId = currentUserProfile.id; // Getting the user ID from the authenticated JWT user

    // If the current user is not an admin, they can only access their own orders
    if (currentUserId !== userId && !this.isAdmin(currentUserProfile)) {
      throw new Error('Unauthorized');
    }

    return this.orderRepository.find({
      where: {userId: userId}, // Filter orders by userId
    });
  }

  @get('/users/{userId}/orders/{orderId}')
  @authenticate('jwt') // Require authentication
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
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile, // Current user data from JWT
  ): Promise<Order> {
    const currentUserId = currentUserProfile.id; // Getting the user ID from the authenticated JWT user

    // If the current user is not an admin, they can only access their own orders
    if (currentUserId !== userId && !this.isAdmin(currentUserProfile)) {
      throw new Error('Unauthorized');
    }

    const order = await this.orderRepository.findOne({
      where: {id: orderId, userId: userId}, // Find the order by ID for the specific user
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  // Helper method to check if the current user is an admin
  private isAdmin(currentUserProfile: UserProfile): boolean {
    // Check if the user has an 'admin' role or any other method that you use to identify admins
    return currentUserProfile.role === 'admin'; // Example check based on role
  }
}
