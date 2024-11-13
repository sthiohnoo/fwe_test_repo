import { and, eq } from 'drizzle-orm';
import type { Database } from '../db';
import { shoppingList } from '../schema/shoppingList.schema';
import { shoppingListItem } from '../schema/shoppingListItem.schema';
import {
  CreateShoppingList,
  UpdateShoppingList,
} from '../../validation/validation';

export class ShoppingListRepository {
  constructor(private readonly db: Database) {}

  async getShoppingList(includeRelations = true) {
    return this.db.query.shoppingList.findMany({
      with: includeRelations
        ? {
            shoppingListItems: {
              with: {
                item: true,
              },
              columns: {
                quantity: true,
                isPurchased: true,
              },
            },
          }
        : undefined,
    });
  }

  async getShoppingListById(shoppingListId: string, includeRelations = true) {
    return this.db.query.shoppingList.findFirst({
      where: (shoppingList, { eq }) => eq(shoppingList.id, shoppingListId),
      with: includeRelations
        ? {
            shoppingListItems: {
              with: {
                item: true,
              },
              columns: {
                quantity: true,
                isPurchased: true,
              },
            },
          }
        : undefined,
    });
  }

  async createShoppingList(data: CreateShoppingList) {
    const [entry] = await this.db.insert(shoppingList).values(data).returning();
    return entry;
  }

  async updateShoppingListById(
    shoppingListId: string,
    data: UpdateShoppingList,
  ) {
    const [updatedList] = await this.db
      .update(shoppingList)
      .set(data)
      .where(eq(shoppingList.id, shoppingListId))
      .returning();
    return updatedList;
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

  async deleteShoppingListById(shoppingListId: string) {
    return this.db
      .delete(shoppingList)
      .where(eq(shoppingList.id, shoppingListId));
  }

  async deleteShoppingListItemsById(shoppingListId: string) {
    return this.db
      .delete(shoppingListItem)
      .where(eq(shoppingListItem.listId, shoppingListId));
  }

  async associateItemsWithShoppingList(
    shoppingListId: string,
    itemIds: string[],
  ) {
    return this.db.insert(shoppingListItem).values(
      itemIds.map((itemId) => ({
        listId: shoppingListId,
        itemId,
        quantity: 1,
        isPurchased: false,
      })),
    );
  }
}
