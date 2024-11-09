import type { Database } from '../db';
import { item } from '../schema/item.schema';

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

  async getItemByName(itemName: string) {
    return this.db.query.item.findFirst({
      where: (item, { eq }) => eq(item.name, itemName),
    });
  }

  async getItemsByNamesOrIds(names: string[], ids: string[]) {
    return this.db.query.item.findMany({
      where: (item, { and, or, inArray }) =>
        and(or(inArray(item.id, ids), inArray(item.name, names))),
    });
  }

  async createItems(data: { name: string; description?: string }[]) {
    return this.db.insert(item).values(data).onConflictDoNothing().returning();
  }
}
