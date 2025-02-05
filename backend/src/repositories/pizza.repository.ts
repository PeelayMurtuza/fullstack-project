import { inject, Getter } from '@loopback/core';
import { DefaultCrudRepository, repository, BelongsToAccessor } from '@loopback/repository';
import { MysqlDataSource } from '../datasources';
import { Pizza, PizzaRelations, User } from '../models';
import { UserRepository } from './user.repository';

export class PizzaRepository extends DefaultCrudRepository<
  Pizza,
  typeof Pizza.prototype.id,
  PizzaRelations
> {
  public readonly user: BelongsToAccessor<User, typeof Pizza.prototype.id>;

  constructor(
    @inject('datasources.mysql') dataSource: MysqlDataSource,
    @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(Pizza, dataSource);
    this.user = this.createBelongsToAccessorFor('userId', userRepositoryGetter);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
