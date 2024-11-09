import { pgTable } from 'drizzle-orm/pg-core';
import { commonSchema } from './common.schema';

export const item = pgTable('item', {
  ...commonSchema,
});
