// !Import all database schemas - import * as xyz from is necessary
import * as schema from './shoppingList.schema';
import * as user from './user.schema';

export const databaseSchema = {
  ...schema,
  ...user,
};
