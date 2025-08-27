import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const drawings = pgTable("drawings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  imageData: text("image_data").notNull(), // Base64 encoded canvas data
  originalImage: text("original_image"), // Base64 encoded original image
  metadata: jsonb("metadata").$type<{
    width: number;
    height: number;
    format: string;
    tools_used: string[];
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDrawingSchema = createInsertSchema(drawings).pick({
  name: true,
  imageData: true,
  originalImage: true,
  metadata: true,
});

export type InsertDrawing = z.infer<typeof insertDrawingSchema>;
export type Drawing = typeof drawings.$inferSelect;
