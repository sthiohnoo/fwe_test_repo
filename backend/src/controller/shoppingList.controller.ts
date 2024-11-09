import { Request, Response } from 'express';
import { z } from 'zod';

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
