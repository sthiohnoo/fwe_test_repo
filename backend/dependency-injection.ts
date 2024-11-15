import { App } from './app';
import { ENV } from './src/config/env.config';
import { Database, db } from './src/db/db';
import { AuthController } from './src/controller/auth.controller';
import { HealthController } from './src/controller/health.controller';
import { ItemController } from './src/controller/item.controller';
import { ShoppingListController } from './src/controller/shoppingList.controller';
import { UserRepository } from './src/db/repository/user.repository';
import { ItemRepository } from './src/db/repository/item.repository';
import { ShoppingListRepository } from './src/db/repository/shoppingList.repository';
import { ShoppingListItemRepository } from './src/db/repository/shoppingListItem.repository';
import { Routes } from './src/routes/routes';

import { Server } from './server';
import { PasswordHasher } from './src/utils/password-hasher';
import { Jwt } from './src/utils/jwt';

export const DI = {} as {
  app: App;
  db: Database;
  server: Server;
  routes: Routes;
  repositories: {
    user: UserRepository;
    item: ItemRepository;
    shoppingList: ShoppingListRepository;
    shoppingListItem: ShoppingListItemRepository;
  };
  controllers: {
    auth: AuthController;
    health: HealthController;
    item: ItemController;
    shoppingList: ShoppingListController;
  };
  utils: {
    passwordHasher: PasswordHasher;
    jwt: Jwt;
  };
};

export function initializeDependencyInjection() {
  // Initialize database
  DI.db = db;

  // Initialize utils
  DI.utils = {
    passwordHasher: new PasswordHasher(10),
    jwt: new Jwt(ENV.JWT_SECRET, {
      expiresIn: 3600,
      issuer: 'localhost:3000',
    }),
  };

  // Initialize repositories
  DI.repositories = {
    user: new UserRepository(DI.db),
    item: new ItemRepository(DI.db),
    shoppingList: new ShoppingListRepository(DI.db),
    shoppingListItem: new ShoppingListItemRepository(DI.db),
  };

  // Initialize controllers
  DI.controllers = {
    auth: new AuthController(
      DI.repositories.user,
      DI.utils.passwordHasher,
      DI.utils.jwt,
    ),
    health: new HealthController(),
    item: new ItemController(
      DI.repositories.item,
      DI.repositories.shoppingListItem,
    ),
    shoppingList: new ShoppingListController(
      DI.repositories.shoppingList,
      DI.repositories.item,
      DI.repositories.shoppingListItem,
    ),
  };

  // Initialize routes
  DI.routes = new Routes(
    DI.controllers.auth,
    DI.controllers.health,
    DI.controllers.item,
    DI.controllers.shoppingList,
  );

  // Initialize app
  DI.app = new App(DI.routes);
  DI.server = new Server(DI.app, ENV);
}
