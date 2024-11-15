import { Request, Response } from 'express';
import { ItemRepository } from '../db/repository/item.repository';
import { createItemZodSchema } from '../validation/validation';

export class ItemController {
  constructor(private readonly itemRepository: ItemRepository) {}

  async getItems(_req: Request, res: Response): Promise<void> {
    const items = await this.itemRepository.getItems();
    res.status(200).send(items);
  }

  async getItemById(req: Request, res: Response): Promise<void> {
    const itemId = req.params.itemId;
    const item = await this.itemRepository.getItemById(itemId);

    if (!item) {
      res.status(404).send({ errors: ['Item not found'] });
      return;
    }

    res.status(200).send(item);
  }

  async getItemByName(req: Request, res: Response): Promise<void> {
    const itemName = req.params.itemName;
    const item = await this.itemRepository.getItemByName(itemName);

    if (!item) {
      res.status(404).send({ errors: ['Item not found'] });
      return;
    }

    res.status(200).send(item);
  }

  async createItem(req: Request, res: Response): Promise<void> {
    const validatedData = createItemZodSchema.parse(req.body);

    for (const item of validatedData) {
      const existingItem = await this.itemRepository.getItemByName(item.name);
      if (existingItem) {
        res
          .status(409)
          .send({ errors: ['Create canceled! Item already exists'] });
        return;
      }
    }

    const transformedData = validatedData.map((item) => ({
      ...item,
      description: item.description ?? undefined,
    }));

    const createdItems = await this.itemRepository.createItems(transformedData);

    res.status(201).send(createdItems);
  }
}
