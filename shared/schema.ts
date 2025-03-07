import { pgTable, text, serial, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const parameters = pgTable("parameters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  value: text("value").notNull(),
  isSecure: boolean("is_secure").notNull().default(false),
  environment: text("environment").notNull(),
  version: integer("version").notNull().default(1),
});

export const insertParameterSchema = createInsertSchema(parameters).pick({
  name: true,
  value: true,
  isSecure: true,
  environment: true,
}).extend({
  name: z.string().min(1, "Name is required"),
  value: z.string().min(1, "Value is required"),
  environment: z.enum(["development", "production"]),
});

export type InsertParameter = z.infer<typeof insertParameterSchema>;
export type Parameter = typeof parameters.$inferSelect;