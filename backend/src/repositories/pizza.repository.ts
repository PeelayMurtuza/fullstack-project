import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {MysqlDataSource} from '../datasources';
import {Pizza, PizzaRelations, Admin} from '../models';
import {AdminRepository} from './admin.repository';

export class PizzaRepository extends DefaultCrudRepository<
  Pizza,
  typeof Pizza.prototype.id,
  PizzaRelations
> {

  public readonly admin: BelongsToAccessor<Admin, typeof Pizza.prototype.id>;

  constructor(
    @inject('datasources.mysql') dataSource: MysqlDataSource, @repository.getter('AdminRepository') protected adminRepositoryGetter: Getter<AdminRepository>,
  ) {
    super(Pizza, dataSource);
    this.admin = this.createBelongsToAccessorFor('admin', adminRepositoryGetter,);
    this.registerInclusionResolver('admin', this.admin.inclusionResolver);
  }
}
