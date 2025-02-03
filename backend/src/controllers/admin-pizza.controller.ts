import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  Admin,
  Pizza,
} from '../models';
import {AdminRepository} from '../repositories';

export class AdminPizzaController {
  constructor(
    @repository(AdminRepository) protected adminRepository: AdminRepository,
  ) { }

  @get('/admins/{id}/pizzas', {
    responses: {
      '200': {
        description: 'Array of Admin has many Pizza',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Pizza)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Pizza>,
  ): Promise<Pizza[]> {
    return this.adminRepository.pizzas(id).find(filter);
  }

  @post('/admins/{id}/pizzas', {
    responses: {
      '200': {
        description: 'Admin model instance',
        content: {'application/json': {schema: getModelSchemaRef(Pizza)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Admin.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Pizza, {
            title: 'NewPizzaInAdmin',
            exclude: ['id'],
            optional: ['adminId']
          }),
        },
      },
    }) pizza: Omit<Pizza, 'id'>,
  ): Promise<Pizza> {
    return this.adminRepository.pizzas(id).create(pizza);
  }

  @patch('/admins/{id}/pizzas', {
    responses: {
      '200': {
        description: 'Admin.Pizza PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Pizza, {partial: true}),
        },
      },
    })
    pizza: Partial<Pizza>,
    @param.query.object('where', getWhereSchemaFor(Pizza)) where?: Where<Pizza>,
  ): Promise<Count> {
    return this.adminRepository.pizzas(id).patch(pizza, where);
  }

  @del('/admins/{id}/pizzas', {
    responses: {
      '200': {
        description: 'Admin.Pizza DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Pizza)) where?: Where<Pizza>,
  ): Promise<Count> {
    return this.adminRepository.pizzas(id).delete(where);
  }
}
