import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {MysqlDataSource} from '../datasources';
import {Order, OrderRelations, User, Pizza} from '../models';
import {UserRepository} from './user.repository';
import {PizzaRepository} from './pizza.repository';

export class OrderRepository extends DefaultCrudRepository<
  Order,
  typeof Order.prototype.id,
  OrderRelations
> {

  public readonly user: BelongsToAccessor<User, typeof Order.prototype.id>;

  public readonly pizza: BelongsToAccessor<Pizza, typeof Order.prototype.id>;

  constructor(
    @inject('datasources.mysql') dataSource: MysqlDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>, @repository.getter('PizzaRepository') protected pizzaRepositoryGetter: Getter<PizzaRepository>,
  ) {
    super(Order, dataSource);
    this.pizza = this.createBelongsToAccessorFor('pizza', pizzaRepositoryGetter,);
    this.registerInclusionResolver('pizza', this.pizza.inclusionResolver);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
