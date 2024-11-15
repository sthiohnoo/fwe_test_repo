import { Router } from 'express';

import { AuthController } from '../controller/auth.controller';
import { HealthController } from '../controller/health.controller';
import { ItemController } from '../controller/item.controller';
import { ShoppingListController } from '../controller/shoppingList.controller';

export class Routes {
  private router: Router;

  constructor(
    private readonly authController: AuthController,
    private readonly healthController: HealthController,
    private readonly itemController: ItemController,
    private readonly shoppingListController: ShoppingListController,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  public getRouter(): Router {
    return this.router;
  }

  /**
   * Initializes the routes for the application.
   * ?.bind(this.authController.) ensures that 'this' inside the controller method refers to the controller instance rather than Express's context
   */
  private initializeRoutes(): void {
    // Auth routes
    this.router.post(
      '/auth/register',
      this.authController.registerUser.bind(this.authController),
    );
    this.router.post(
      '/auth/login',
      this.authController.loginUser.bind(this.authController),
    );

    // Health routes
    this.router.get(
      '/health',
      this.healthController.getHealthStatus.bind(this.healthController),
    );

    // Item routes
    this.router.get(
      '/items',
      this.itemController.getItems.bind(this.itemController),
    );
    this.router.get(
      '/items/:itemId',
      this.itemController.getItemById.bind(this.itemController),
    );
    this.router.get(
      '/items/name/:itemName',
      this.itemController.getItemByName.bind(this.itemController),
    );
    this.router.post(
      '/items',
      this.itemController.createItem.bind(this.itemController),
    );

    // Shopping list routes
    this.router.get(
      '/shoppingLists',
      this.shoppingListController.getShoppingLists.bind(
        this.shoppingListController,
      ),
    );
    this.router.get(
      '/shoppingLists/:shoppingListId',
      this.shoppingListController.getShoppingListById.bind(
        this.shoppingListController,
      ),
    );
    this.router.post(
      '/shoppingLists',
      this.shoppingListController.createShoppingList.bind(
        this.shoppingListController,
      ),
    );
    this.router.put(
      '/shoppingLists/:shoppingListId',
      this.shoppingListController.updateShoppingListById.bind(
        this.shoppingListController,
      ),
    );
    this.router.put(
      '/shoppingLists/:shoppingListId/items/:itemId',
      this.shoppingListController.addItemToList.bind(
        this.shoppingListController,
      ),
    );
    this.router.delete(
      '/shoppingLists/:shoppingListId/items/:itemId',
      this.shoppingListController.deleteItemInListById.bind(
        this.shoppingListController,
      ),
    );
    this.router.delete(
      '/shoppingLists/:shoppingListId',
      this.shoppingListController.deleteShoppingListById.bind(
        this.shoppingListController,
      ),
    );
  }
}
