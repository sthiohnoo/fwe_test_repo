import type { Database } from '../db';
import { user } from '../schema/user.schema';
import { CreateUser } from '../../validation/validation';

export class UserRepository {
  constructor(private readonly db: Database) {}

  async getUserById(id: string) {
    return this.db.query.user.findFirst({
      where: (user, { eq }) => eq(user.id, id),
    });
  }

  async getUserByEmail(email: string) {
    return this.db.query.user.findFirst({
      where: (user, { eq }) => eq(user.email, email),
    });
  }

  async createUser(data: CreateUser) {
    return this.db.insert(user).values(data).returning({
      //mit returnig wird das erstellte Objekt zurückgegeben
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  }
}
