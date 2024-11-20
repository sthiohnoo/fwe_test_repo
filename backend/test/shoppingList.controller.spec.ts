import request from 'supertest';
import express, { Application } from 'express';
import { TestDatabase } from './helpers/database';
import { ShoppingListTestHelper } from './helpers/shoppingList';
import { ItemTestHelper } from './helpers/item';

import { ShoppingListController } from '../src/controller/shoppingList.controller';
import { ShoppingListItemRepository } from '../src/db/repository/shoppingListItem.repository';
import { ItemRepository } from '../src/db/repository/item.repository';
import { ShoppingListRepository } from '../src/db/repository/shoppingList.repository';
import { globalErrorHandler } from '../src/utils/global-error';

const TEST_IDS = {
  ITEM_1: '123e4567-e89b-12d3-a456-426614174000',
  ITEM_2: '123e4567-e89b-12d3-a456-426614174013',
  LIST_1: '123e4567-e89b-12d3-a456-426614174001',
  LIST_2: '123e4567-e89b-12d3-a456-426614174002',
  NON_EXISTENT_SHOPPINGLIST: '123e4567-e89b-12d3-a456-426614174010',
  NON_EXISTENT_ITEM: '123e4567-e89b-12d3-a456-426614174011',
  INVALID_ID: 'invalid-id',
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
  }, 30000);

  beforeEach(async () => {
    app = express();
    app.use(express.json());

    app.get('/shoppingLists', controller.getShoppingLists.bind(controller));
    app.get(
      '/shoppingLists/search',
      controller.searchShoppingListsWithNameOrDescription.bind(controller),
    );
    app.get(
      '/shoppingLists/:shoppingListId',
      controller.getShoppingListById.bind(controller),
    );
    app.get(
      '/shoppingLists/items/:itemId',
      controller.getShoppingListsWithSearchingItemById.bind(controller),
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

    app.use(globalErrorHandler);

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

  describe('GET /shoppingLists', () => {
    it('should return 200 with empty array without a shoppingList', async () => {
      // Arrange
      await testDatabase.clear();

      // Act
      const response = await request(app).get('/shoppingLists');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return 200 with shoppingLists', async () => {
      // Act
      const response = await request(app).get('/shoppingLists');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });
  describe('GET /shoppingLists/:shoppingListId', () => {
    it('should return 200 with shoppingList', async () => {
      // Act
      const response = await request(app).get(
        '/shoppingLists/' + TEST_IDS.LIST_1,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(typeof response.body).toBe('object');
      expect(Array.isArray(response.body)).toBe(false);
      expect(response.body.id).toBe(TEST_IDS.LIST_1);
    });

    it('should return 400  with message for invalid id format', async () => {
      // Act
      const response = await request(app).get(
        '/shoppingLists/' + TEST_IDS.INVALID_ID,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message:
              'Invalid shoppingList-id format. please provide a valid UUID',
          }),
        ]),
      );
    });

    it('should return 404 with message for non-existent shoppingList', async () => {
      // Act
      const response = await request(app).get(
        '/shoppingLists/' + TEST_IDS.NON_EXISTENT_SHOPPINGLIST,
      );

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.errors).toContain('ShoppingList not found');
    });
  });

  describe('GET /shoppingLists/items/:itemId', () => {
    it('should return 200 with shoppingLists', async () => {
      // Arrange
      const newShoppingList_1 = {
        name: 'shoppingList 1 with ITEM_1',
        items: [{ id: TEST_IDS.ITEM_1 }],
      };
      const newShoppingList_2 = {
        name: 'shoppingList 2 with ITEM_1',
        items: [{ id: TEST_IDS.ITEM_1 }],
      };
      const createdShoppingList_1 = await request(app)
        .post('/shoppingLists')
        .send(newShoppingList_1)
        .set('Accept', 'application/json');
      const createdShoppingList_2 = await request(app)
        .post('/shoppingLists')
        .send(newShoppingList_2)
        .set('Accept', 'application/json');

      // Act
      const response = await request(app).get(
        '/shoppingLists/items/' + TEST_IDS.ITEM_1,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);

      expect(response.body[0].listId).toBe(createdShoppingList_1.body.id);
      expect(response.body[0].itemId).toBe(TEST_IDS.ITEM_1);
      expect(response.body[1].listId).toBe(createdShoppingList_2.body.id);
      expect(response.body[1].itemId).toBe(TEST_IDS.ITEM_1);
    });

    it('should return 400 with message for invalid id format', async () => {
      // Act
      const response = await request(app).get(
        '/shoppingLists/items/' + TEST_IDS.INVALID_ID,
      );

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: 'Invalid itemId format. please provide a valid UUID',
          }),
        ]),
      );
    });

    it('should return 404 for item not in any shoppingList', async () => {
      // Act
      const response = await request(app).get(
        '/shoppingLists/items/' + TEST_IDS.ITEM_1,
      );

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.errors).toContain('Item not found in ShoppingLists');
    });
  });

  describe('GET /shoppingLists/search', () => {
    it('should return 200 with a shoppingList with only the name', async () => {
      // Act
      const response = await request(app).get(
        '/shoppingLists/search?name=shoppingList1&description=/' + undefined,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].id).toBe(TEST_IDS.LIST_1);
      expect(response.body[0].name).toBe('shoppingList1');
      expect(response.body[0].description).toBe('shoppingList1_description');
    });

    it('should return 200 with a shoppingList with only the description', async () => {
      // Act
      const response = await request(app).get(
        '/shoppingLists/search?name=' +
          undefined +
          '&description=shoppingList2_description',
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].id).toBe(TEST_IDS.LIST_2);
      expect(response.body[0].name).toBe('shoppingList2');
      expect(response.body[0].description).toBe('shoppingList2_description');
    });

    it('should return 200 with a shoppingList matching the given name and description', async () => {
      // Act
      const response = await request(app).get(
        '/shoppingLists/search?name=shoppingList1&description=shoppingList1_description',
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].id).toBe(TEST_IDS.LIST_1);
      expect(response.body[0].name).toBe('shoppingList1');
      expect(response.body[0].description).toBe('shoppingList1_description');
    });

    it('should return 200 with all shoppingLists matching with part of the name', async () => {
      // Act
      const response = await request(app).get(
        '/shoppingLists/search?name=List&description=/' + undefined,
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
    });

    it('should return 200 with all shoppingLists with empty name and description', async () => {
      // Act
      const response = await request(app).get(
        '/shoppingLists/search?name=&description=',
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return 404 with message with no matching name and description', async () => {
      // Act
      const response = await request(app).get(
        '/shoppingLists/search?name=non_existent_name&description=non_existent_description',
      );

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.errors).toContain('ShoppingList not found');
    });
  });
});
