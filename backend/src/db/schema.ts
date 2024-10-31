import { relations } from "drizzle-orm";
import { uuid, integer, text, timestamp, boolean, pgTable } from "drizzle-orm/pg-core";

export const shoppingLists = pgTable("shopping_lists", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const items = pgTable("items", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
});

export const shoppingListItems = pgTable("shopping_list_items", {
    listId: uuid("list_id").references(() => shoppingLists.id).notNull(),
    itemId: uuid("item_id").references(() => items.id).notNull(),
    quantity: integer("quantity").notNull(),
    isPurchased: boolean("is_purchased").default(false).notNull(),
});
