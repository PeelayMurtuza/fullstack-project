import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Pizza,
  Admin,
} from '../models';
import {PizzaRepository} from '../repositories';

export class PizzaAdminController {
  constructor(
    @repository(PizzaRepository)
    public pizzaRepository: PizzaRepository,
  ) { }

  @get('/pizzas/{id}/admin', {
    responses: {
      '200': {
        description: 'Admin belonging to Pizza',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Admin),
          },
        },
      },
    },
  })
  async getAdmin(
    @param.path.number('id') id: typeof Pizza.prototype.id,
  ): Promise<Admin> {
    return this.pizzaRepository.admin(id);
  }
}
