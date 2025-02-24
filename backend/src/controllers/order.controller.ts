import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import {Order} from '../models';
import {OrderRepository} from '../repositories';
import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {inject} from '@loopback/core';
import {UserRole} from '../models/user.model';
import {basicAuthorization} from '../interceptors/authorize.interceptor';

export class OrderController {
  constructor(
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
  ) {}

  @post('/orders')
  @authenticate('jwt')
  @authorize({
    allowedRoles: [UserRole.USER, UserRole.ADMIN],
    voters: [basicAuthorization],
  })
  @response(200, {
    description: 'Order model instance',
    content: {'application/json': {schema: getModelSchemaRef(Order)}},
  })
  async create(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile, // Moved before requestBody
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Order, {
            title: 'NewOrder',
            exclude: ['id'],
          }),
        },
      },
    })
    order: Omit<Order, 'id'>,
  ): Promise<Order> {
    order.userId = currentUserProfile.id; // Assign the logged-in user as owner
    return this.orderRepository.create(order);
  }

  @get('/orders/count')
  @authenticate('jwt')
  @authorize({allowedRoles: [UserRole.ADMIN]})
  @response(200, {
    description: 'Order model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Order) where?: Where<Order>): Promise<Count> {
    return this.orderRepository.count(where);
  }

  @get('/orders')
  @authenticate('jwt')
  @authorize({allowedRoles: [UserRole.ADMIN]})
  @response(200, {
    description: 'Array of Order model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Order, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Order) filter?: Filter<Order>): Promise<Order[]> {
    return this.orderRepository.find(filter);
  }

  @get('/orders/{id}')
  @authenticate('jwt')
  @authorize({
    allowedRoles: [UserRole.ADMIN, UserRole.USER],
    voters: [basicAuthorization],
  })
  @response(200, {
    description: 'Order model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Order, {includeRelations: true}),
      },
    },
  })
  async findById(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile, // Moved before param
    @param.path.number('id') id: number,
    @param.filter(Order, {exclude: 'where'}) filter?: FilterExcludingWhere<Order>,
  ): Promise<Order> {
    const order = await this.orderRepository.findById(id, filter);
    if (!order) {
      throw new HttpErrors.NotFound('Order not found');
    }

    // Only allow admins or the owner of the order
    if (currentUserProfile.role !== UserRole.ADMIN && order.userId !== currentUserProfile.id) {
      throw new HttpErrors.Forbidden('Access denied');
    }

    return order;
  }

  @patch('/orders/{id}')
  @authenticate('jwt')
  @authorize({
    allowedRoles: [UserRole.ADMIN, UserRole.USER],
    voters: [basicAuthorization],
  })
  @response(204, {
    description: 'Order PATCH success',
  })
  async updateById(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Order, {partial: true}),
        },
      },
    })
    order: Order,
  ): Promise<void> {
    const existingOrder = await this.orderRepository.findById(id);
    if (!existingOrder) {
      throw new HttpErrors.NotFound('Order not found');
    }

    if (currentUserProfile.role !== UserRole.ADMIN && existingOrder.userId !== currentUserProfile.id) {
      throw new HttpErrors.Forbidden('Access denied');
    }

    await this.orderRepository.updateById(id, order);
  }

  @put('/orders/{id}')
  @authenticate('jwt')
  @authorize({allowedRoles: [UserRole.ADMIN]})
  @response(204, {
    description: 'Order PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() order: Order,
  ): Promise<void> {
    await this.orderRepository.replaceById(id, order);
  }

  @del('/orders/{id}')
  @authenticate('jwt')
  @authorize({allowedRoles: [UserRole.ADMIN]})
  @response(204, {
    description: 'Order DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.orderRepository.deleteById(id);
  }
}
