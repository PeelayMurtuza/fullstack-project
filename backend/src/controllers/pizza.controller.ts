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
import {Pizza} from '../models';
import {PizzaRepository} from '../repositories';
import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {User} from '../models'; // Import the User model
import {inject} from '@loopback/core'; // Correct import for inject

export class PizzaController {
  constructor(
    @repository(PizzaRepository)
    public pizzaRepository: PizzaRepository,
  ) {}

  @post('/pizzas')
  @authenticate('jwt') // Require authentication
  @authorize({allowedRoles: ['admin']}) // Only admins can add pizzas
  @response(200, {
    description: 'Pizza model instance',
    content: {'application/json': {schema: getModelSchemaRef(Pizza)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Pizza, {
            title: 'NewPizza',
            exclude: ['id'],
          }),
        },
      },
    })
    pizza: Omit<Pizza, 'id'>,
    @inject('authentication.currentUser') currentUser: User, // Inject currentUser from authentication context
  ): Promise<Pizza> {
    if (!currentUser.id) {
      throw new Error('User ID is required to associate the pizza.');
    }

    // Ensure userId is set to the authenticated user's id (TypeScript knows currentUser.id is defined now)
    pizza.userId = currentUser.id; // Associate the userId (admin) here
    return this.pizzaRepository.create(pizza);
  }

  @get('/pizzas/count')
  @authenticate('jwt')
  @authorize({allowedRoles: ['admin']}) // Only admins can count pizzas
  @response(200, {
    description: 'Pizza model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Pizza) where?: Where<Pizza>): Promise<Count> {
    return this.pizzaRepository.count(where);
  }

  @get('/pizzas')
  @authenticate('jwt')
  @response(200, {
    description: 'Array of Pizza model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Pizza, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Pizza) filter?: Filter<Pizza>): Promise<Pizza[]> {
    return this.pizzaRepository.find(filter);
  }

  @get('/pizzas/{id}')
  @authenticate('jwt')
  @response(200, {
    description: 'Pizza model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Pizza, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Pizza, {exclude: 'where'}) filter?: FilterExcludingWhere<Pizza>,
  ): Promise<Pizza> {
    return this.pizzaRepository.findById(id, filter);
  }

  @patch('/pizzas/{id}')
  @authenticate('jwt')
  @authorize({allowedRoles: ['admin']}) // Only admins can update pizzas
  @response(204, {
    description: 'Pizza PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Pizza, {partial: true}),
        },
      },
    })
    pizza: Pizza,
  ): Promise<void> {
    await this.pizzaRepository.updateById(id, pizza);
  }

  @put('/pizzas/{id}')
  @authenticate('jwt')
  @authorize({allowedRoles: ['admin']}) // Only admins can replace pizzas
  @response(204, {
    description: 'Pizza PUT success',
  })
  async replaceById(@param.path.number('id') id: number, @requestBody() pizza: Pizza): Promise<void> {
    await this.pizzaRepository.replaceById(id, pizza);
  }

  @del('/pizzas/{id}')
  @authenticate('jwt')
  @authorize({allowedRoles: ['admin']}) // Only admins can delete pizzas
  @response(204, {
    description: 'Pizza DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.pizzaRepository.deleteById(id);
  }
}
