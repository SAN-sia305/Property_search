import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertPropertySchema, insertFavoriteSchema, insertSavedSearchSchema, insertActivitySchema, insertAlertSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Properties routes
  app.get("/api/properties", async (req, res) => {
    try {
      const properties = await storage.getProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const property = await storage.getProperty(id);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  // Favorites routes
  app.get("/api/favorites", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const favorites = await storage.getFavoritesByUser(req.user.id);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const validatedData = insertFavoriteSchema.parse({
        userId: req.user.id,
        propertyId: req.body.propertyId
      });
      
      const isFavorite = await storage.isFavorite(req.user.id, validatedData.propertyId);
      if (isFavorite) {
        return res.status(400).json({ message: "Property already in favorites" });
      }
      
      const favorite = await storage.addFavorite(validatedData);
      
      // Record this activity
      await storage.createActivity({
        userId: req.user.id,
        type: "favorite",
        propertyId: validatedData.propertyId,
        details: { action: "added" }
      });
      
      res.status(201).json(favorite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorites/:propertyId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const propertyId = parseInt(req.params.propertyId);
      const result = await storage.removeFavorite(req.user.id, propertyId);
      
      if (!result) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      
      // Record this activity
      await storage.createActivity({
        userId: req.user.id,
        type: "favorite",
        propertyId,
        details: { action: "removed" }
      });
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  // Saved searches routes
  app.get("/api/saved-searches", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const searches = await storage.getSavedSearchesByUser(req.user.id);
      res.json(searches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch saved searches" });
    }
  });

  app.post("/api/saved-searches", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const validatedData = insertSavedSearchSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const search = await storage.createSavedSearch(validatedData);
      
      // Record this activity
      await storage.createActivity({
        userId: req.user.id,
        type: "search",
        details: { name: validatedData.name }
      });
      
      res.status(201).json(search);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to save search" });
    }
  });

  app.delete("/api/saved-searches/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const id = parseInt(req.params.id);
      
      // Verify the search belongs to the user
      const search = await storage.getSavedSearch(id);
      if (!search || search.userId !== req.user.id) {
        return res.status(404).json({ message: "Saved search not found" });
      }
      
      const result = await storage.deleteSavedSearch(id);
      
      if (!result) {
        return res.status(404).json({ message: "Saved search not found" });
      }
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete saved search" });
    }
  });

  // User activity routes
  app.get("/api/activities", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getActivitiesByUser(req.user.id, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post("/api/activities", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const validatedData = insertActivitySchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const activity = await storage.createActivity(validatedData);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create activity" });
    }
  });

  // Alerts routes
  app.get("/api/alerts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const alerts = await storage.getAlertsByUser(req.user.id);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const validatedData = insertAlertSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const alert = await storage.createAlert(validatedData);
      res.status(201).json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create alert" });
    }
  });

  app.patch("/api/alerts/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const id = parseInt(req.params.id);
      
      // Verify the alert belongs to the user
      const alert = await storage.getAlert(id);
      if (!alert || alert.userId !== req.user.id) {
        return res.status(404).json({ message: "Alert not found" });
      }
      
      const updatedAlert = await storage.updateAlert(id, req.body);
      
      if (!updatedAlert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      
      res.json(updatedAlert);
    } catch (error) {
      res.status(500).json({ message: "Failed to update alert" });
    }
  });

  app.delete("/api/alerts/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const id = parseInt(req.params.id);
      
      // Verify the alert belongs to the user
      const alert = await storage.getAlert(id);
      if (!alert || alert.userId !== req.user.id) {
        return res.status(404).json({ message: "Alert not found" });
      }
      
      const result = await storage.deleteAlert(id);
      
      if (!result) {
        return res.status(404).json({ message: "Alert not found" });
      }
      
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete alert" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
