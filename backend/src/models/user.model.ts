import {Entity, model, property, hasMany} from '@loopback/repository';
import {Order} from './order.model';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@model()
export class User extends Entity {
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
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(UserRole),
    },
  })
  role: UserRole;

  @hasMany(() => Order)
  orders: Order[];

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
