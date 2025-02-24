import {repository} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
  response,
  HttpErrors,
} from '@loopback/rest';
import {Order, Pizza} from '../models';
import {OrderRepository, PizzaRepository} from '../repositories';
import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {UserRole} from '../models/user.model';
import {basicAuthorization} from '../interceptors/authorize.interceptor'; 

export class OrderPizzaController {
  constructor(
    @repository(OrderRepository)
    public orderRepository: OrderRepository,

    @repository(PizzaRepository) // Inject the PizzaRepository
    public pizzaRepository: PizzaRepository,
  ) {}

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
  @authenticate('jwt') // Require JWT authentication
  @authorize({allowedRoles: [UserRole.ADMIN, UserRole.USER], voters: [basicAuthorization]}) // Apply authorization
  async getPizza(
    @param.path.number('id') id: typeof Order.prototype.id, // Order ID from the path
  ): Promise<Pizza> {
    // Retrieve the order by ID
    const order = await this.orderRepository.findById(id);

    // Ensure the order has a pizzaId to associate with a pizza
    if (!order.pizzaId) {
      throw new HttpErrors.NotFound('Order does not have an associated pizza');
    }

    // Retrieve the pizza using the pizzaId from the order
    return this.pizzaRepository.findById(order.pizzaId);
  }
}
