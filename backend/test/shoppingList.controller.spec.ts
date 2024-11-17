import request from 'supertest';
import express, { Application } from 'express';
import { TestDatabase } from './helpers/database';
import { ShoppingListController } from '../src/controller/shoppingList.controller';
import { ShoppingListItemRepository } from '../src/db/repository/shoppingListItem.repository';
import { ItemRepository } from '../src/db/repository/item.repository';
import { ShoppingListRepository } from '../src/db/repository/shoppingList.repository';

describe('ShoppingListController Integration Tests', () => {
  const testDatabase = new TestDatabase();
  let app: Application;
  let controller: ShoppingListController;
  let shoppingListItemRepository: ShoppingListItemRepository;
  let shoppingListRepository: ShoppingListRepository;
  let itemRepository: ItemRepository;

  beforeAll(async () => {
    await testDatabase.setup();

    shoppingListRepository = new ShoppingListRepository(testDatabase.database);
    itemRepository = new ItemRepository(testDatabase.database);
    shoppingListItemRepository = new ShoppingListItemRepository(
      testDatabase.database,
    );

    controller = new ShoppingListController(
      shoppingListRepository,
      itemRepository,
      shoppingListItemRepository,
    );
  }, 30000);

  beforeEach(() => {
    app = express();
    app.get('/shoppingLists', controller.getShoppingLists.bind(controller));
    app.get(
      '/shoppingLists/:shoppingListId',
      controller.getShoppingListById.bind(controller),
    );
    app.get(
      '/shoppingLists/items/:itemId',
      controller.getShoppingListsWithSearchingItemById.bind(controller),
    );
    app.get(
      '/shoppingLists/:name/:description',
      controller.searchShoppingListsWithNameOrDescription.bind(controller),
    );
    app.post('/shoppingLists', controller.createShoppingList.bind(controller));
    app.put(
      '/shoppingLists/:shoppingListId',
      controller.updateShoppingListById.bind(controller),
    );
    app.put(
      '/shoppingLists/:shoppingListId/items/:itemId',
      controller.addItemToList.bind(controller),
    );
    app.delete(
      '/shoppingLists/:shoppingListId/items/:itemId',
      controller.deleteItemInListById.bind(controller),
    );
    app.delete(
      '/shoppingLists/:shoppingListId',
      controller.deleteShoppingListById.bind(controller),
    );
  });

  afterEach(async () => {
    await testDatabase.clear();
  });

  afterAll(async () => {
    await testDatabase.teardown();
  });

  describe('GET /shoppingLists/:shoppingListId', () => {
    it('should return 200 with empty array without a shoppingList', async () => {
      // Act
      const response = await request(app).get('/shoppingLists');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return 404 for non-existent shoppingList', async () => {
      // Act
      const response = await request(app).get(
        '/shopping-lists/non-existent-id',
      );

      // Assert
      //expect(response.status).toBe(404);
    });
  });

  // Weitere Tests für andere Endpunkte
});
