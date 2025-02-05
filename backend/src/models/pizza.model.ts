import {Entity, model, property, belongsTo} from '@loopback/repository';
import { User } from './user.model';

@model()
export class Pizza extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  @property({
    type: 'number',
    required: true,
  })
  price: number;

  @property({
    type: 'boolean',
    required: true,
  })
  isAvailable: boolean;

  @property({
    type: 'string',
    required: true,
  })
  imageUrl: string;

  // Ensure foreign key is correctly specified in @belongsTo
  @belongsTo(() => User, {name: 'userId'})
  userId: number;  // Foreign key for the User (admin) model

  constructor(data?: Partial<Pizza>) {
    super(data);
  }
}

export interface PizzaRelations {
  // describe navigational properties here
}

export type PizzaWithRelations = Pizza & PizzaRelations;
