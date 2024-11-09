import {
  boolean,
  integer,
  pgTable,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { commonSchema } from './common.schema';

export const shoppingLists = pgTable('shopping_lists', {
  ...commonSchema,
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const items = pgTable('items', {
  ...commonSchema,
});

export const shoppingListItems = pgTable('shopping_list_items', {
  listId: uuid('list_id')
    .references(() => shoppingLists.id)
    .notNull(),
  itemId: uuid('item_id')
    .references(() => items.id)
    .notNull(),
  quantity: integer('quantity').notNull(),
  isPurchased: boolean('is_purchased').default(false).notNull(),
});
