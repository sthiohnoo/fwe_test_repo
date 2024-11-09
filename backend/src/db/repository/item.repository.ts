import type { Database } from '../db';

export class ItemRepository {
  constructor(private readonly db: Database) {}

  async getItems() {
    return this.db.query.item.findMany();
  }

  async getItemById(itemId: string) {
    return this.db.query.item.findFirst({
      where: (item, { eq }) => eq(item.id, itemId),
    });
  }
}
