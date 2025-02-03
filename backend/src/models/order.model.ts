import {Entity, model, property, belongsTo} from '@loopback/repository';
import {User} from './user.model';
import {Pizza} from './pizza.model';

@model()
export class Order extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
    required: true,
  })
  quantity: number;

  @property({
    type: 'number',
    required: true,
  })
  totalprice: number;

  @property({
    type: 'string',
    required: true,
  })
  status: string;
  @belongsTo(() => User)
  userId: number;

  @belongsTo(() => Pizza)
  pizzaId: number;

  constructor(data?: Partial<Order>) {
    super(data);
  }
}

export interface OrderRelations {
  // describe navigational properties here
}

export type OrderWithRelations = Order & OrderRelations;
