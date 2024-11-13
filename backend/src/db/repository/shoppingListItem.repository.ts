import type { Database } from '../db';

export class ShoppingListItemRepository {
  constructor(private readonly db: Database) {}

  async getItemInListById(itemId: string) {
    return this.db.query.shoppingListItem.findFirst({
      where: (shoppingListItem, { eq }) => eq(shoppingListItem.itemId, itemId),
    });
  }
}
