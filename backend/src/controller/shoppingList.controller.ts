import { Request, Response } from 'express';
import { z } from 'zod';
import { createShoppingListZodSchema } from '../validation/validation';

import { ShoppingListRepository } from '../db/repository/shoppingList.repository';
import { ItemRepository } from '../db/repository/item.repository';

export class ShoppingListController {
  constructor(
    private readonly shoppingListRepository: ShoppingListRepository,
    private readonly itemRepository: ItemRepository,
  ) {}

  async getShoppingLists(req: Request, res: Response): Promise<void> {
    const withRelations = z
      .boolean()
      .default(true)
      .parse(
        req.query.withRelations === 'true' ||
          req.query.withRelations === 'undefined',
      );

    const shoppingLists =
      await this.shoppingListRepository.getShoppingList(withRelations);
    res.send(shoppingLists);
  }

  async getShoppingListById(req: Request, res: Response): Promise<void> {
    const withRelations = z
      .boolean()
      .default(true)
      .parse(
        req.query.withRelations === 'true' ||
          req.query.withRelations === 'undefined',
      );

    const shoppingLists = await this.shoppingListRepository.getShoppingListById(
      req.params.shoppingListId,
      withRelations,
    );
    res.send(shoppingLists);
  }

  async createShoppingList(req: Request, res: Response): Promise<void> {
    const validatedData = createShoppingListZodSchema.parse(req.body);

    const createdShoppingList =
      await this.shoppingListRepository.createShoppingList(validatedData);

    const itemsWithName = [];
    const itemsWithId = [];

    if (validatedData.items) {
      for (const item of validatedData.items) {
        if (item.id) {
          itemsWithId.push(item.id);
        } else if (item.name) {
          itemsWithName.push({
            name: item.name,
            description: item.description,
          });
        }
      }
    }

    // Create possibly new items if there are any items with only names
    if (itemsWithName.length > 0) {
      await this.itemRepository.createItems(itemsWithName);
    }

    // Associate tags with the diary entry if there are any tags
    if (itemsWithId.length > 0) {
      // Get all tags with given names or ids to make sure we have all ids and they exist and are associated with the user
      const items = await this.itemRepository.getItemsByNamesOrIds(
        itemsWithName.map((t) => t.name),
        itemsWithId,
      );
      await this.shoppingListRepository.associateItemsWithShoppingList(
        createdShoppingList.id,
        items.map((t) => t.id),
      );
    }

    const shoppingListWithItems =
      await this.shoppingListRepository.getShoppingListById(
        createdShoppingList.id,
      );

    res.status(201).send(shoppingListWithItems);
  }

  async deleteShoppingListById(req: Request, res: Response): Promise<void> {
    const { shoppingListId } = req.params;
    const validateId = z
      .string()
      .uuid({ message: 'Invalid id format. please provide a valid UUID' })
      .parse(shoppingListId);

    const existingShoppingList =
      await this.shoppingListRepository.getShoppingListById(validateId);

    if (!existingShoppingList) {
      res.status(404).json({ errors: ['shoppingList not found'] });
      return;
    }

    await this.shoppingListRepository.deleteShoppingListById(validateId);
    res.status(204).send({});
  }
}
