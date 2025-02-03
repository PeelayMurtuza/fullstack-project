import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Order,
  Pizza,
} from '../models';
import {OrderRepository} from '../repositories';

export class OrderPizzaController {
  constructor(
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
  ) { }

  @get('/orders/{id}/pizza', {
    responses: {
      '200': {
        description: 'Pizza belonging to Order',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Pizza),
          },
        },
      },
    },
  })
  async getPizza(
    @param.path.number('id') id: typeof Order.prototype.id,
  ): Promise<Pizza> {
    return this.orderRepository.pizza(id);
  }
}
