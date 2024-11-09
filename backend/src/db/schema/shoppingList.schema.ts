import { pgTable, timestamp } from 'drizzle-orm/pg-core';

import { commonSchema } from './common.schema';

export const shoppingList = pgTable('shopping_list', {
  ...commonSchema,
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
