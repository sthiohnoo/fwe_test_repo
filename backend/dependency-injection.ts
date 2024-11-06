import { App } from './app';
import { ENV } from './src/config/env.config';
import { Database, db } from './src/db/db';
import { Server } from './server';

export const DI = {} as {
  app: App;
  db: Database;
  server: Server;
};

export function initializeDependencyInjection() {
  // Initialize database
  DI.db = db;

  // Initialize app
  DI.app = new App();
  DI.server = new Server(DI.app, ENV);
}
