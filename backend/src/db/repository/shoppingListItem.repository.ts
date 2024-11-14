import type { Database } from '../db';
import { shoppingListItem } from '../schema/shoppingListItem.schema';
import { and, eq } from 'drizzle-orm';
import { AddItemToList } from '../../validation/validation';

export class ShoppingListItemRepository {
  constructor(private readonly db: Database) {}

  async getItemInListById(itemId: string) {
    return this.db.query.shoppingListItem.findFirst({
      where: (shoppingListItem, { eq }) => eq(shoppingListItem.itemId, itemId),
    });
  }

  async getListInListById(listId: string) {
    return this.db.query.shoppingListItem.findFirst({
      where: (shoppingListItem, { eq }) => eq(shoppingListItem.listId, listId),
    });
  }

  async updateListItemById(
    listId: string,
    itemId: string,
    data: { quantity?: number; isPurchased?: boolean },
  ) {
    const [updatedItem] = await this.db
      .update(shoppingListItem)
      .set(data)
      .where(
        and(
          eq(shoppingListItem.itemId, itemId),
          eq(shoppingListItem.listId, listId),
        ),
      )
      .returning();
    return updatedItem;
  }

  async addItemToList(data: AddItemToList) {
    const [entry] = await this.db
      .insert(shoppingListItem)
      .values(data)
      .returning();
    return entry;
  }

  async deleteListInListById(shoppingListId: string) {
    return this.db
      .delete(shoppingListItem)
      .where(eq(shoppingListItem.listId, shoppingListId));
  }

  async deleteItemInListById(listId: string, itemId: string) {
    return this.db
      .delete(shoppingListItem)
      .where(
        and(
          eq(shoppingListItem.listId, listId),
          eq(shoppingListItem.itemId, itemId),
        ),
      );
  }
}
