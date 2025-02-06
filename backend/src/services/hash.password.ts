import {inject} from '@loopback/core';
import {compare, genSalt, hash} from 'bcryptjs';
import {PasswordHasherBindings} from '../keys';

export interface PasswordHasher<T = string> {
  hashPassword(password: T): Promise<T>;
  comparePassword(providedPass: T, storedPass: T): Promise<boolean>;
}

export class BcryptHasher implements PasswordHasher<string> {
  constructor(
    @inject(PasswordHasherBindings.ROUNDS)
    public readonly rounds: number, 
  ) {}

  async comparePassword(
    providedPass: string,
    storedPass: string,
  ): Promise<boolean> {
    return compare(providedPass, storedPass);
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(this.rounds || 10); // Default to 10 rounds
    return hash(password, salt);
  }
}
