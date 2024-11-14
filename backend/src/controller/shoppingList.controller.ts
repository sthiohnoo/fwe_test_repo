import { Request, Response } from 'express';
import { z } from 'zod';
import {
  addItemToListZodSchema,
  createShoppingListZodSchema,
  updateShoppingListZodSchema,
} from '../validation/validation';

import { ShoppingListRepository } from '../db/repository/shoppingList.repository';
import { ItemRepository } from '../db/repository/item.repository';
import { ShoppingListItemRepository } from '../db/repository/shoppingListItem.repository';

export class ShoppingListController {
  constructor(
    private readonly shoppingListRepository: ShoppingListRepository,
    private readonly itemRepository: ItemRepository,
    private readonly shoppingListItemRepository: ShoppingListItemRepository,
  ) {}

  async getShoppingLists(req: Request, res: Response): Promise<void> {
    const withRelations = z
      .boolean()
      .default(true)
      .parse(
        req.query.withRelations === 'true' ||
          req.query.withRelations === undefined,
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
          req.query.withRelations === undefined,
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
      const createdItems = await this.itemRepository.createItems(itemsWithName);
      itemsWithId.push(...createdItems.map((item) => item.id));
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

  async updateShoppingListById(req: Request, res: Response): Promise<void> {
    const { shoppingListId } = req.params;

    const validatedId = z
      .string()
      .uuid({
        message: 'Invalid shoppingList-id format. please provide a valid UUID',
      })
      .parse(shoppingListId);

    const existingShoppingList =
      await this.shoppingListRepository.getShoppingListById(validatedId);
    if (!existingShoppingList) {
      res.status(404).json({ errors: ['shoppingList not found'] });
      return;
    }

    const validatedData = updateShoppingListZodSchema.parse(req.body);

    if (validatedData.items) {
      const existingListInList =
        await this.shoppingListItemRepository.getListInListById(validatedId);
      if (!existingListInList) {
        res.status(404).json({
          errors: [
            'Update canceled! updating list not found in the shoppingList',
          ],
        });
        return;
      }

      for (const item of validatedData.items) {
        const existingItemInList =
          await this.shoppingListItemRepository.getItemInListById(item.id);
        if (!existingItemInList) {
          res.status(404).json({
            errors: [
              'Update canceled! updating item not found in the shoppingList',
            ],
          });
          return;
        }
      }
    }

    const updatedShoppingList =
      await this.shoppingListRepository.updateShoppingListById(
        validatedId,
        validatedData,
      );

    if (validatedData.items) {
      for (const item of validatedData.items) {
        await this.shoppingListItemRepository.updateListItemById(
          validatedId,
          item.id,
          {
            quantity: item.quantity,
            isPurchased: item.isPurchased,
          },
        );
      }
    }
    res.send(updatedShoppingList);
  }

  async addItemToList(req: Request, res: Response): Promise<void> {
    const { shoppingListId, itemId } = req.params;

    const validatedData = addItemToListZodSchema.parse({
      ...req.body,
      listId: shoppingListId,
      itemId: itemId,
    });

    const existingShoppingList =
      await this.shoppingListRepository.getShoppingListById(
        validatedData.listId,
      );
    if (!existingShoppingList) {
      res.status(404).json({ errors: ['ShoppingList not found'] });
      return;
    }

    const existingItem = await this.itemRepository.getItemById(
      validatedData.itemId,
    );
    if (!existingItem) {
      res.status(404).json({ errors: ['Item not found'] });
      return;
    }

    const existingItemInList =
      await this.shoppingListItemRepository.getItemInListById(
        validatedData.itemId,
      );
    if (existingItemInList) {
      res.status(409).json({ errors: ['Item already in the ShoppingList'] });
      return;
    }

    const addedItemInList =
      await this.shoppingListItemRepository.addItemToList(validatedData);

    res.status(201).send(addedItemInList);
  }

  async deleteItemInListById(req: Request, res: Response): Promise<void> {
    const { shoppingListId, itemId } = req.params;
    const validatedShoppingListId = z
      .string()
      .uuid({
        message: 'Invalid shoppingListId format. please provide a valid UUID',
      })
      .parse(shoppingListId);

    const validatedItemId = z
      .string()
      .uuid({ message: 'Invalid itemId format. please provide a valid UUID' })
      .parse(itemId);

    const existingListInList =
      await this.shoppingListItemRepository.getListInListById(
        validatedShoppingListId,
      );
    if (!existingListInList) {
      res.status(404).json({ errors: ['ShoppingList has no Items'] });
      return;
    }

    const deletedItem =
      await this.shoppingListItemRepository.deleteItemInListById(
        validatedShoppingListId,
        validatedItemId,
      );
    if (deletedItem.rowCount === 0) {
      res.status(404).json({ errors: ['Item not found in the ShoppingList'] });
      return;
    }
    res.status(204).send({});
  }

  async deleteShoppingListById(req: Request, res: Response): Promise<void> {
    const { shoppingListId } = req.params;
    const validatedId = z
      .string()
      .uuid({ message: 'Invalid id format. please provide a valid UUID' })
      .parse(shoppingListId);

    const existingShoppingList =
      await this.shoppingListRepository.getShoppingListById(validatedId);

    if (!existingShoppingList) {
      res.status(404).json({ errors: ['shoppingList not found'] });
      return;
    }

    await this.shoppingListItemRepository.deleteListInListById(validatedId);
    await this.shoppingListRepository.deleteShoppingListById(validatedId);
    res.status(204).send({});
  }
}
