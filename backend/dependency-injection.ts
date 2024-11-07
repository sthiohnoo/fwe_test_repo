import { App } from './app';
import { ENV } from './src/config/env.config';
import { Database, db } from './src/db/db';
import { Server } from './server';
import { PasswordHasher } from './src/utils/password-hasher';
import { Jwt } from './src/utils/jwt';

export const DI = {} as {
  app: App;
  db: Database;
  server: Server;
  utils: {
    passwordHasher: PasswordHasher;
    jwt: Jwt;
  };
};

export function initializeDependencyInjection() {
  // Initialize database
  DI.db = db;

  DI.utils = {
    passwordHasher: new PasswordHasher(10),
    jwt: new Jwt(ENV.JWT_SECRET, {
      expiresIn: 3600,
      issuer: 'localhost:3000',
    }),
  };

  // Initialize app
  DI.app = new App();
  DI.server = new Server(DI.app, ENV);
}
