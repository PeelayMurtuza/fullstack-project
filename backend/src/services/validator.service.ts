import {Entity, model, property} from '@loopback/repository';

@model()
export class User extends Entity {
  @property({
    type: 'string',
    required: true,
    index: {unique: true},
    jsonSchema: {
      format: 'email',
      errorMessage: 'Invalid email format',
    },
  })
  email: string;

  @property({
    type: 'string',
    required: true,
    minLength: 8,
    jsonSchema: {
      errorMessage: 'Password must be at least 8 characters long',
    },
  })
  password: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: ['admin', 'user'], // Restrict values to 'admin' or 'user'
      errorMessage: 'Role must be either "admin" or "user"',
    },
  })
  role: string;
}
