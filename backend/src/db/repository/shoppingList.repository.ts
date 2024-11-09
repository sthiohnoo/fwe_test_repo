import { eq } from 'drizzle-orm';
import type { Database } from '../db';
import { shoppingLists } from '../schema/schema';

export class ShoppingListRepository {
  constructor(private readonly db: Database) {}

  async getShoppingList(includeRelations = true) {
    return this.db.query.shoppingLists.findMany({
      with: includeRelations
        ? {
            shoppingListItems: {
              with: {
                state: true,
                isPurchased: true,
              },
            },
          }
        : undefined,
    });
  }

  async getShoppingListById(shoppingListId: string, includeRelations = true) {
    return this.db.query.shoppingLists.findFirst({
      where: (shoppingLists, { eq }) => eq(shoppingLists.id, shoppingListId),
      with: includeRelations
        ? {
            shoppingListItems: {
              with: {
                state: true,
                isPurchased: true,
              },
            },
          }
        : undefined,
    });
  }

  async deleteShoppingListById(shoppingListId: string) {
    return this.db
      .delete(shoppingLists)
      .where(eq(shoppingLists.id, shoppingListId));
  }
}
