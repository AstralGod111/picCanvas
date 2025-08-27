import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDrawingSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all drawings
  app.get("/api/drawings", async (req, res) => {
    try {
      const drawings = await storage.getAllDrawings();
      res.json(drawings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch drawings" });
    }
  });

  // Get specific drawing
  app.get("/api/drawings/:id", async (req, res) => {
    try {
      const drawing = await storage.getDrawing(req.params.id);
      if (!drawing) {
        return res.status(404).json({ message: "Drawing not found" });
      }
      res.json(drawing);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch drawing" });
    }
  });

  // Create new drawing
  app.post("/api/drawings", async (req, res) => {
    try {
      const validatedData = insertDrawingSchema.parse(req.body);
      const drawing = await storage.createDrawing(validatedData);
      res.status(201).json(drawing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid drawing data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create drawing" });
    }
  });

  // Update drawing
  app.put("/api/drawings/:id", async (req, res) => {
    try {
      const updates = insertDrawingSchema.partial().parse(req.body);
      const drawing = await storage.updateDrawing(req.params.id, updates);
      if (!drawing) {
        return res.status(404).json({ message: "Drawing not found" });
      }
      res.json(drawing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid drawing data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update drawing" });
    }
  });

  // Delete drawing
  app.delete("/api/drawings/:id", async (req, res) => {
    try {
      const success = await storage.deleteDrawing(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Drawing not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete drawing" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
