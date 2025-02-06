import { inject } from '@loopback/core';
import { DefaultCrudRepository } from '@loopback/repository';
import { MysqlDataSource } from '../datasources';
import { Pizza, PizzaRelations } from '../models';

export class PizzaRepository extends DefaultCrudRepository<
  Pizza,
  typeof Pizza.prototype.id,
  PizzaRelations
> {
  constructor(
    @inject('datasources.mysql') dataSource: MysqlDataSource,
  ) {
    super(Pizza, dataSource);
  }
}