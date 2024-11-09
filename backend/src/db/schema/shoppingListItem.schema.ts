import { boolean, integer, pgTable, uuid } from 'drizzle-orm/pg-core';
import { item } from './item.schema';
import { shoppingList } from './shoppingList.schema';

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
