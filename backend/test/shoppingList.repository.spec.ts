import { TestDatabase } from './helpers/database';
import { ItemTestHelper } from './helpers/item';
import { ShoppingListRepository } from '../src/db/repository/shoppingList.repository';

const TEST_IDS = {
  ITEM_1: '123e4567-e89b-12d3-a456-426614174000',
  ITEM_2: '123e4567-e89b-12d3-a456-426614174013',
  NON_EXISTENT_SHOPPINGLIST: '123e4567-e89b-12d3-a456-426614174010',
} as const;

describe('ShoppingListRepository Integration Tests', () => {
  const testDatabase = new TestDatabase();
  let repository: ShoppingListRepository;
  let itemHelper: ItemTestHelper;

  beforeAll(async () => {
    await testDatabase.setup();
    repository = new ShoppingListRepository(testDatabase.database);
    itemHelper = new ItemTestHelper(testDatabase.database);

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
  }, 30000);

  afterEach(async () => {
    await testDatabase.clear();
  });

  afterAll(async () => {
    await testDatabase.teardown();
  });

  describe('getShoppingList', () => {
    it('should successfully retrieve all shoppingLists', async () => {
      // Arrange
      const testSL_WithItems = {
        name: 'Test Shopping List with items',
        description: 'Test Description with items',
        createdAt: new Date(),
        items: [
          {
            id: TEST_IDS.ITEM_1,
          },
          {
            id: TEST_IDS.ITEM_2,
          },
        ],
      };

      const testSL_WithoutDescription = {
        name: 'Test Shopping List 2',
        createdAt: new Date(),
      };

      const createdSL_WithItems =
        await repository.createShoppingList(testSL_WithItems);
      const createdSL_WithoutDesc = await repository.createShoppingList(
        testSL_WithoutDescription,
      );

      const items = [
        { id: TEST_IDS.ITEM_1 /*, quantity: 1, isPurchased: false*/ },
        { id: TEST_IDS.ITEM_2 /*, quantity: 1, isPurchased: false */ },
      ];
      await repository.associateItemsWithShoppingList(
        createdSL_WithItems.id,
        items.map((item) => item.id),
      );

      // Act
      const result = await repository.getShoppingList();

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);

      const retrievedSLItems = result.find(
        (list) => list.id === createdSL_WithItems.id,
      );
      const retrievedSLNoDesc = result.find(
        (list) => list.id === createdSL_WithoutDesc.id,
      );

      expect(retrievedSLItems).toBeDefined();
      expect(retrievedSLItems?.id).toBe(createdSL_WithItems.id);
      expect(retrievedSLItems?.name).toBe(testSL_WithItems.name);
      expect(retrievedSLItems?.description).toBe(testSL_WithItems.description);

      /**
             * TODO: Not sure how to assert created items of the list, is it even possible here?
             expect(retrievedSLItems?.shoppingListItems).toBeDefined();
             expect(retrievedSLItems?.shoppingListItems.length).toBe(2);
             expect(retrievedSLItems?.shoppingListItems).toEqual(
             expect.arrayContaining([
             expect.objectContaining({
             quantity: 1,
             isPurchased: false,
             item: expect.objectContaining({
             id: TEST_IDS.ITEM_1,
             name: 'item1',
             description: 'item1_description',
             }),
             }),
             expect.objectContaining({
             quantity: 1,
             isPurchased: false,
             item: expect.objectContaining({
             id: TEST_IDS.ITEM_2,
             name: 'item2',
             description: 'item2_description',
             }),
             }),
             ]),
             );
             */

      expect(retrievedSLNoDesc).toBeDefined();
      expect(retrievedSLNoDesc?.id).toBe(createdSL_WithoutDesc.id);
      expect(retrievedSLNoDesc?.name).toBe(testSL_WithoutDescription.name);
      expect(retrievedSLNoDesc?.description).toBeNull();
    });

    it('should return an empty array with no shoppingLists', async () => {
      // Act
      const result = await repository.getShoppingList();

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
  });

  describe('getShoppingListById', () => {
    it('should successfully retrieve a shoppingList by id', async () => {
      // Arrange
      const testShoppingList = {
        name: 'Test Shopping List',
        description: 'Test Description',
        createdAt: new Date(),
      };
      const createdShoppingList = await repository.createShoppingList({
        name: testShoppingList.name,
        description: testShoppingList.description,
      });

      // Act
      const result = await repository.getShoppingListById(
        createdShoppingList.id,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe(createdShoppingList.id);
      expect(result?.name).toBe(testShoppingList.name);
      expect(result?.description).toBe(testShoppingList.description);
    });

    it('should return undefined for non-existent shoppingList', async () => {
      // Act
      const result = await repository.getShoppingListById(
        TEST_IDS.NON_EXISTENT_SHOPPINGLIST,
      );

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('updateShoppingListById', () => {
    it('should successfully update a shoppingList', async () => {
      // Arrange
      const testShoppingList = {
        name: 'Test Shopping List',
        description: 'Test Description',
        createdAt: new Date(),
      };
      const createdShoppingList =
        await repository.createShoppingList(testShoppingList);
      const updatedData = {
        name: 'Updated Name',
        description: 'Updated Description',
      };

      // Act
      const updatedShoppingList = await repository.updateShoppingListById(
        createdShoppingList.id,
        updatedData,
      );

      // Assert
      expect(updatedShoppingList).toBeDefined();
      expect(updatedShoppingList?.id).toBe(createdShoppingList.id);
      expect(updatedShoppingList?.name).toBe(updatedData.name);
      expect(updatedShoppingList?.description).toBe(updatedData.description);
    });

    it('should successfully update with only a part of the data', async () => {
      // Arrange
      const testShoppingList = {
        name: 'Test Shopping List',
        description: 'Test Description',
        createdAt: new Date(),
      };
      const createdShoppingList =
        await repository.createShoppingList(testShoppingList);
      const updatedData = {
        name: 'Updated only Name',
      };

      // Act
      const updatedShoppingList = await repository.updateShoppingListById(
        createdShoppingList.id,
        updatedData,
      );

      // Assert
      expect(updatedShoppingList).toBeDefined();
      expect(updatedShoppingList?.id).toBe(createdShoppingList.id);
      expect(updatedShoppingList?.name).toBe(updatedData.name);
      expect(updatedShoppingList?.description).toBe(
        testShoppingList.description,
      );
    });

    it('should return undefined with non-existent shoppingList', async () => {
      // Arrange
      const updatedData = {
        name: 'Updated Name',
        description: 'Updated Description',
      };

      // Act
      const result = await repository.updateShoppingListById(
        TEST_IDS.NON_EXISTENT_SHOPPINGLIST,
        updatedData,
      );

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('deleteShoppingListById', () => {
    it('should successfully delete a shoppingList', async () => {
      // Arrange
      const testShoppingList = {
        name: 'Delete Shopping List',
        description: 'Delete Description',
        createdAt: new Date(),
      };
      const createdShoppingList =
        await repository.createShoppingList(testShoppingList);

      // Act
      await repository.deleteShoppingListById(createdShoppingList.id);
      const result = await repository.getShoppingListById(
        createdShoppingList.id,
      );

      // Assert
      expect(result).toBeUndefined();
    });

    it('should delete nothing with non-existent shoppingList', async () => {
      // Arrange
      const countBeforeDeletion = (await repository.getShoppingList()).length;

      // Act
      await repository.deleteShoppingListById(
        TEST_IDS.NON_EXISTENT_SHOPPINGLIST,
      );
      const countAfterDeletion = (await repository.getShoppingList()).length;

      // Assert
      expect(countAfterDeletion).toBeDefined();
      expect(countAfterDeletion).toBe(countBeforeDeletion);
    });
  });

  describe('searchShoppingLists', () => {
    it('should successfully search shoppingLists by name', async () => {
      // Arrange
      const testShoppingList = {
        name: 'Search Shopping List',
        description: 'Search Description',
        createdAt: new Date(),
      };
      await repository.createShoppingList(testShoppingList);

      // Act
      const results = await repository.searchShoppingLists(
        'Search Shopping List',
      );

      // Assert
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe(testShoppingList.name);
    });

    it('should successfully search shoppingLists by part of description', async () => {
      // Arrange
      const testShoppingList = {
        name: 'Search Shopping List',
        description: 'Search Description',
        createdAt: new Date(),
      };
      await repository.createShoppingList(testShoppingList);

      // Act
      const results = await repository.searchShoppingLists(undefined, 'Desc');

      // Assert
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe(testShoppingList.name);
    });

    it('should return all shoppingLists with nothing to search', async () => {
      // Arrange
      const testShoppingList = {
        name: 'Search Shopping List',
        description: 'Search Description',
        createdAt: new Date(),
      };
      await repository.createShoppingList(testShoppingList);

      // Act
      const results = await repository.searchShoppingLists(
        undefined,
        undefined,
      );

      // Assert
      expect(results).toBeDefined();
      expect(results.length).toBe(1);
    });
  });
});
