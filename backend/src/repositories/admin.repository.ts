import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {MysqlDataSource} from '../datasources';
import {Admin, AdminRelations, Pizza} from '../models';
import {PizzaRepository} from './pizza.repository';

export class AdminRepository extends DefaultCrudRepository<
  Admin,
  typeof Admin.prototype.id,
  AdminRelations
> {

  public readonly pizzas: HasManyRepositoryFactory<Pizza, typeof Admin.prototype.id>;

  constructor(
    @inject('datasources.mysql') dataSource: MysqlDataSource, @repository.getter('PizzaRepository') protected pizzaRepositoryGetter: Getter<PizzaRepository>,
  ) {
    super(Admin, dataSource);
    this.pizzas = this.createHasManyRepositoryFactoryFor('pizzas', pizzaRepositoryGetter,);
    this.registerInclusionResolver('pizzas', this.pizzas.inclusionResolver);
  }
}
