import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { user } from '../db/schema/user.schema';
import { shoppingList } from '../db/schema/shoppingList.schema';
import { DI } from '../../dependency-injection';

export const selectUserZodSchema = createSelectSchema(user);

export const createUserZodSchema = createInsertSchema(user, {
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
}).transform(async (data) => {
  return {
    ...data,
    password: await DI.utils.passwordHasher.hashPassword(data.password),
  };
});

export const loginZodSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const createShoppingListZodSchema = createInsertSchema(shoppingList, {
  name: z.string().min(1),
  description: z.string().optional(),
})
  .pick({
    name: true,
    description: true,
  })
  .extend({
    items: z
      .array(
        z
          .object({
            id: z.string().uuid().optional(),
            name: z.string().min(1).optional(),
            description: z.string().optional(),
          })
          .refine((data) => data.id ?? data.name, {
            message: 'At least one of id or name must be provided',
          }),
      )
      .optional(),
  });

export const updateShoppingListZodSchema = createInsertSchema(shoppingList, {
  name: z.string().min(1).optional(),
  description: z.string().optional(),
})
  .pick({
    name: true,
    description: true,
  })
  .extend({
    items: z
      .array(
        z.object({
          id: z.string().uuid({
            message: 'Invalid item-id format. please provide a valid UUID',
          }),
          quantity: z.number().min(1).optional(),
          isPurchased: z.boolean().optional(),
        }),
      )
      .optional(),
  });

export type DbUser = z.infer<typeof selectUserZodSchema>;
export type CreateUser = z.infer<typeof createUserZodSchema>;
export type CreateShoppingList = z.infer<typeof createShoppingListZodSchema>;
export type UpdateShoppingList = z.infer<typeof updateShoppingListZodSchema>;
