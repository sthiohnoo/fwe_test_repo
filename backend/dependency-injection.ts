import { App } from './app';
import { ENV } from './src/config/env.config';
import { AuthController } from './src/controller/auth.controller';
import { HealthController } from './src/controller/health.controller';
import { Database, db } from './src/db/db';
import { UserRepository } from './src/db/repository/user.repository';
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
  };
  controllers: {
    auth: AuthController;
    health: HealthController;
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
  };

  // Initialize controllers
  DI.controllers = {
    auth: new AuthController(
      DI.repositories.user,
      DI.utils.passwordHasher,
      DI.utils.jwt,
    ),
    health: new HealthController(),
  };

  // Initialize routes
  DI.routes = new Routes(DI.controllers.auth, DI.controllers.health);

  // Initialize app
  DI.app = new App(DI.routes);
  DI.server = new Server(DI.app, ENV);
}
