import { type Drawing, type InsertDrawing } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getDrawing(id: string): Promise<Drawing | undefined>;
  getAllDrawings(): Promise<Drawing[]>;
  createDrawing(drawing: InsertDrawing): Promise<Drawing>;
  updateDrawing(id: string, drawing: Partial<InsertDrawing>): Promise<Drawing | undefined>;
  deleteDrawing(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private drawings: Map<string, Drawing>;

  constructor() {
    this.drawings = new Map();
  }

  async getDrawing(id: string): Promise<Drawing | undefined> {
    return this.drawings.get(id);
  }

  async getAllDrawings(): Promise<Drawing[]> {
    return Array.from(this.drawings.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async createDrawing(insertDrawing: InsertDrawing): Promise<Drawing> {
    const id = randomUUID();
    const now = new Date();
    const drawing: Drawing = {
      id,
      name: insertDrawing.name,
      imageData: insertDrawing.imageData,
      originalImage: insertDrawing.originalImage || null,
      metadata: insertDrawing.metadata || null,
      createdAt: now,
      updatedAt: now,
    };
    this.drawings.set(id, drawing);
    return drawing;
  }

  async updateDrawing(id: string, updates: Partial<InsertDrawing>): Promise<Drawing | undefined> {
    const existing = this.drawings.get(id);
    if (!existing) return undefined;

    const updated: Drawing = {
      id: existing.id,
      name: updates.name ?? existing.name,
      imageData: updates.imageData ?? existing.imageData,
      originalImage: updates.originalImage !== undefined ? updates.originalImage : existing.originalImage,
      metadata: updates.metadata !== undefined ? updates.metadata : existing.metadata,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    };
    this.drawings.set(id, updated);
    return updated;
  }

  async deleteDrawing(id: string): Promise<boolean> {
    return this.drawings.delete(id);
  }
}

export const storage = new MemStorage();
