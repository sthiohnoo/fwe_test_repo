import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';

import { Database } from '../../src/db/db';
import { databaseSchema } from '../../src/db/schema';

export class TestDatabase {
  public database!: Database;
  private container!: StartedPostgreSqlContainer;

  async setup() {
    this.container = await new PostgreSqlContainer().start();
    this.database = drizzle({
      connection: this.container.getConnectionUri(),
      schema: databaseSchema,
      casing: 'snake_case',
    });
    await migrate(this.database, { migrationsFolder: './drizzle' });
  }

  async teardown() {
    await (this.database.$client as { end: () => Promise<void> }).end();
    await this.container.stop();
  }
}
