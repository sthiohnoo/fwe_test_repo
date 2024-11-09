// !Import all database schemas - import * as xyz from is necessary
import * as shoppingList from './shoppingList.schema';
import * as item from './item.schema';
import * as shoppingListItem from './shoppingListItem.schema';
import * as user from './user.schema';

export const databaseSchema = {
  ...shoppingList,
  ...item,
  ...shoppingListItem,
  ...user,
};
