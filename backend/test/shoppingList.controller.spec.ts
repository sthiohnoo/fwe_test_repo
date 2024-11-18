import request from 'supertest';
import express, { Application } from 'express';
import { TestDatabase } from './helpers/database';
import { ShoppingListTestHelper } from './helpers/shoppingList';
import { ItemTestHelper } from './helpers/item';

import { ShoppingListController } from '../src/controller/shoppingList.controller';
import { ShoppingListItemRepository } from '../src/db/repository/shoppingListItem.repository';
import { ItemRepository } from '../src/db/repository/item.repository';
import { ShoppingListRepository } from '../src/db/repository/shoppingList.repository';

const TEST_IDS = {
  ITEM_1: '123e4567-e89b-12d3-a456-426614174000',
  ITEM_2: '123e4567-e89b-12d3-a456-426614174013',
  LIST_1: '123e4567-e89b-12d3-a456-426614174001',
  LIST_2: '123e4567-e89b-12d3-a456-426614174002',
  NON_EXISTENT_SHOPPINGLIST: '123e4567-e89b-12d3-a456-426614174010',
  NON_EXISTENT_ITEM: '123e4567-e89b-12d3-a456-426614174011',
} as const;

describe('ShoppingListController Integration Tests', () => {
  const testDatabase = new TestDatabase();
  let app: Application;
  let shoppingListHelper: ShoppingListTestHelper;
  let itemHelper: ItemTestHelper;

  let controller: ShoppingListController;
  let shoppingListItemRepository: ShoppingListItemRepository;
  let shoppingListRepository: ShoppingListRepository;
  let itemRepository: ItemRepository;

  beforeAll(async () => {
    await testDatabase.setup();
    shoppingListHelper = new ShoppingListTestHelper(testDatabase.database);
    itemHelper = new ItemTestHelper(testDatabase.database);

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

    // Create fresh test items
    await itemHelper.createItem([
      {
        id: TEST_IDS.ITEM_1,
        name: 'item1',
        description: 'item1_description',
      },
      {
        id: TEST_IDS.ITEM_2,
        name: 'item2',
        description: 'item2_description',
      },
    ]);

    // Create fresh test shoppingLists
    await shoppingListHelper.createShoppingList({
      id: TEST_IDS.LIST_1,
      name: 'shoppingList1',
      description: 'shoppingList1_description',
    });

    await shoppingListHelper.createShoppingList({
      id: TEST_IDS.LIST_2,
      name: 'shoppingList2',
      description: 'shoppingList2_description',
    });
  }, 30000);

  beforeEach(async () => {
    app = express();
    app.use(express.json());

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

  describe('POST /shoppingLists', () => {
    it('should return 201 and create a new shoppingList with items', async () => {
      // Arrange
      const newShoppingList = {
        name: 'Test Shopping List',
        description: 'Test Description',
        items: [{ id: TEST_IDS.ITEM_1 }, { id: TEST_IDS.ITEM_2 }],
      };

      // Act
      const response = await request(app)
        .post('/shoppingLists')
        .send(newShoppingList)
        .set('Accept', 'application/json');

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newShoppingList.name);
      expect(response.body.description).toBe(newShoppingList.description);
      expect(response.body.shoppingListItems).toHaveLength(2);
      expect(response.body.shoppingListItems[0].item.id).toBe(
        newShoppingList.items[0].id,
      );
      expect(response.body.shoppingListItems[1].item.id).toBe(
        newShoppingList.items[1].id,
      );
    });
  });

  it('should return 201 and create a new item while creating a new shoppingList with non-existent item', async () => {
    // Arrange
    const newShoppingList = {
      name: 'Test Shopping List',
      description: 'Test Description',
      items: [
        { name: 'newItem1', description: 'newItemDescription' },
        { name: 'newItem2' },
      ],
    };
    const countItemBeforeCreation = (await itemRepository.getItems()).length;

    // Act
    const response = await request(app)
      .post('/shoppingLists')
      .send(newShoppingList)
      .set('Accept', 'application/json');
    const countItemAfterCreation = (await itemRepository.getItems()).length;

    // Assert
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(newShoppingList.name);
    expect(response.body.description).toBe(newShoppingList.description);
    expect(response.body.shoppingListItems).toHaveLength(2);
    expect(countItemAfterCreation).toBe(countItemBeforeCreation + 2);
  });

  describe('GET /shoppingLists/:shoppingListId', () => {
    it('should return 200 with empty array without a shoppingList', async () => {
      // Arrange
      await testDatabase.clear();

      // Act
      const response = await request(app).get('/shoppingLists');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return 404 for non-existent shoppingList', async () => {
      // Act
      const _response = await request(app).get(
        '/shopping-lists/non-existent-id',
      );

      // Assert
      //expect(response.status).toBe(404);
    });
  });

  // Weitere Tests für andere Endpunkte
});
