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
} from '@loopback/rest';
import {Order} from '../models';
import {OrderRepository} from '../repositories';
import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';

export class OrderController {
  constructor(
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
  ) {}

  @post('/orders')
  @authenticate('jwt') // Require authentication
  @authorize({allowedRoles: ['user']}) // Only users can place an order
  @response(200, {
    description: 'Order model instance',
    content: {'application/json': {schema: getModelSchemaRef(Order)}},
  })
  async create(
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
    return this.orderRepository.create(order);
  }

  @get('/orders/count')
  @authenticate('jwt')
  @authorize({allowedRoles: ['admin']}) // Only admins can count orders
  @response(200, {
    description: 'Order model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Order) where?: Where<Order>): Promise<Count> {
    return this.orderRepository.count(where);
  }

  @get('/orders')
  @authenticate('jwt')
  @authorize({allowedRoles: ['admin']}) // Only admins can list orders
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
  @authorize({allowedRoles: ['admin', 'user']}) // Admins & users can view their orders
  @response(200, {
    description: 'Order model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Order, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Order, {exclude: 'where'}) filter?: FilterExcludingWhere<Order>,
  ): Promise<Order> {
    return this.orderRepository.findById(id, filter);
  }

  @get('/users/{userId}/orders')
  @authenticate('jwt')
  @authorize({allowedRoles: ['user', 'admin']}) // Admins & users can view orders by user
  @response(200, {
    description: 'Array of Order model instances by user',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Order, {includeRelations: true}),
        },
      },
    },
  })
  async findByUser(
    @param.path.number('userId') userId: number,
    @param.filter(Order) filter?: Filter<Order>,
  ): Promise<Order[]> {
    return this.orderRepository.find({
      where: {userId},
      ...filter,
    });
  }

  @patch('/orders/{id}')
  @authenticate('jwt')
  @authorize({allowedRoles: ['admin', 'user']}) // Admins & users can update their orders
  @response(204, {
    description: 'Order PATCH success',
  })
  async updateById(
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
    await this.orderRepository.updateById(id, order);
  }

  @put('/orders/{id}')
  @authenticate('jwt')
  @authorize({allowedRoles: ['admin']}) // Only admins can replace orders
  @response(204, {
    description: 'Order PUT success',
  })
  async replaceById(@param.path.number('id') id: number, @requestBody() order: Order): Promise<void> {
    await this.orderRepository.replaceById(id, order);
  }

  @del('/orders/{id}')
  @authenticate('jwt')
  @authorize({allowedRoles: ['admin']}) // Only admins can delete orders
  @response(204, {
    description: 'Order DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.orderRepository.deleteById(id);
  }
}
