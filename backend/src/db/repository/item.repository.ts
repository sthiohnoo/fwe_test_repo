import type { Database } from '../db';

export class ItemRepository {
  constructor(private readonly db: Database) {}

  async getItems() {
    return this.db.query.items.findMany();
  }

  async getItemById(itemId: string) {
    return this.db.query.items.findFirst({
      where: (items, { eq }) => eq(items.id, itemId),
    });
  }
}
