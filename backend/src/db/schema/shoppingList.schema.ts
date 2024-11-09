import {
  boolean,
  integer,
  pgTable,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { commonSchema } from './common.schema';

export const shoppingList = pgTable('shopping_list', {
  ...commonSchema,
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const item = pgTable('item', {
  ...commonSchema,
});

export const shoppingListItem = pgTable('shopping_list_item', {
  listId: uuid('list_id')
    .references(() => shoppingList.id)
    .notNull(),
  itemId: uuid('item_id')
    .references(() => item.id)
    .notNull(),
  quantity: integer('quantity').notNull(),
  isPurchased: boolean('is_purchased').default(false).notNull(),
});
