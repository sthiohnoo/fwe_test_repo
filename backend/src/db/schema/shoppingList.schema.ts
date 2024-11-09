import { relations } from 'drizzle-orm';
import { pgTable, timestamp } from 'drizzle-orm/pg-core';

import { commonSchema } from './common.schema';
import { shoppingListItem } from './shoppingListItem.schema';

export const shoppingList = pgTable('shopping_list', {
  ...commonSchema,
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const shoppingListRelations = relations(shoppingList, ({ many }) => ({
  shoppingListItems: many(shoppingListItem),
}));
