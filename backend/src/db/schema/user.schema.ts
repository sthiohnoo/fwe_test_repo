import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  email: varchar({ length: 256 }).notNull(),
  password: varchar({ length: 256 }).notNull(),
  firstName: varchar('first_name', { length: 256 }).notNull(),
  lastName: varchar('last_name', { length: 256 }).notNull(),
});
