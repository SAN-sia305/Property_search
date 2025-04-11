import { 
  users, type User, type InsertUser,
  properties, type Property, type InsertProperty,
  favorites, type Favorite, type InsertFavorite,
  savedSearches, type SavedSearch, type InsertSavedSearch,
  activities, type Activity, type InsertActivity,
  alerts, type Alert, type InsertAlert
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Property operations
  getProperties(filters?: Partial<Property>): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<Property>): Promise<Property | undefined>;
  
  // Favorites operations
  getFavoritesByUser(userId: number): Promise<Property[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: number, propertyId: number): Promise<boolean>;
  isFavorite(userId: number, propertyId: number): Promise<boolean>;
  
  // Saved searches operations
  getSavedSearchesByUser(userId: number): Promise<SavedSearch[]>;
  getSavedSearch(id: number): Promise<SavedSearch | undefined>;
  createSavedSearch(search: InsertSavedSearch): Promise<SavedSearch>;
  deleteSavedSearch(id: number): Promise<boolean>;
  
  // Activity operations
  getActivitiesByUser(userId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Alerts operations
  getAlertsByUser(userId: number): Promise<Alert[]>;
  getAlert(id: number): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: number, alert: Partial<Alert>): Promise<Alert | undefined>;
  deleteAlert(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private favorites: Map<number, Favorite>;
  private savedSearches: Map<number, SavedSearch>;
  private activities: Map<number, Activity>;
  private alerts: Map<number, Alert>;
  
  private userIdCounter: number;
  private propertyIdCounter: number;
  private favoriteIdCounter: number;
  private savedSearchIdCounter: number;
  private activityIdCounter: number;
  private alertIdCounter: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.favorites = new Map();
    this.savedSearches = new Map();
    this.activities = new Map();
    this.alerts = new Map();
    
    this.userIdCounter = 1;
    this.propertyIdCounter = 1;
    this.favoriteIdCounter = 1;
    this.savedSearchIdCounter = 1;
    this.activityIdCounter = 1;
    this.alertIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Initialize with some sample property data
    this.initSampleProperties();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  // Property operations
  async getProperties(filters?: Partial<Property>): Promise<Property[]> {
    let properties = Array.from(this.properties.values());
    
    if (filters) {
      properties = properties.filter(property => {
        for (const [key, value] of Object.entries(filters)) {
          if (property[key as keyof Property] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    return properties;
  }
  
  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }
  
  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = this.propertyIdCounter++;
    const now = new Date();
    const property: Property = { ...insertProperty, id, createdAt: now };
    this.properties.set(id, property);
    return property;
  }
  
  async updateProperty(id: number, propertyUpdate: Partial<Property>): Promise<Property | undefined> {
    const property = this.properties.get(id);
    if (!property) return undefined;
    
    const updatedProperty = { ...property, ...propertyUpdate };
    this.properties.set(id, updatedProperty);
    return updatedProperty;
  }
  
  // Favorites operations
  async getFavoritesByUser(userId: number): Promise<Property[]> {
    const userFavorites = Array.from(this.favorites.values())
      .filter(favorite => favorite.userId === userId);
    
    return Promise.all(
      userFavorites.map(async favorite => {
        const property = await this.getProperty(favorite.propertyId);
        if (!property) throw new Error(`Property with ID ${favorite.propertyId} not found`);
        return property;
      })
    );
  }
  
  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const id = this.favoriteIdCounter++;
    const now = new Date();
    const favorite: Favorite = { ...insertFavorite, id, createdAt: now };
    this.favorites.set(id, favorite);
    return favorite;
  }
  
  async removeFavorite(userId: number, propertyId: number): Promise<boolean> {
    const favoriteEntry = Array.from(this.favorites.entries())
      .find(([_, favorite]) => favorite.userId === userId && favorite.propertyId === propertyId);
    
    if (!favoriteEntry) return false;
    
    this.favorites.delete(favoriteEntry[0]);
    return true;
  }
  
  async isFavorite(userId: number, propertyId: number): Promise<boolean> {
    return Array.from(this.favorites.values())
      .some(favorite => favorite.userId === userId && favorite.propertyId === propertyId);
  }
  
  // Saved searches operations
  async getSavedSearchesByUser(userId: number): Promise<SavedSearch[]> {
    return Array.from(this.savedSearches.values())
      .filter(search => search.userId === userId);
  }
  
  async getSavedSearch(id: number): Promise<SavedSearch | undefined> {
    return this.savedSearches.get(id);
  }
  
  async createSavedSearch(insertSearch: InsertSavedSearch): Promise<SavedSearch> {
    const id = this.savedSearchIdCounter++;
    const now = new Date();
    const search: SavedSearch = { ...insertSearch, id, createdAt: now };
    this.savedSearches.set(id, search);
    return search;
  }
  
  async deleteSavedSearch(id: number): Promise<boolean> {
    return this.savedSearches.delete(id);
  }
  
  // Activity operations
  async getActivitiesByUser(userId: number, limit = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const now = new Date();
    const activity: Activity = { ...insertActivity, id, createdAt: now };
    this.activities.set(id, activity);
    return activity;
  }
  
  // Alerts operations
  async getAlertsByUser(userId: number): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter(alert => alert.userId === userId);
  }
  
  async getAlert(id: number): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }
  
  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.alertIdCounter++;
    const now = new Date();
    const alert: Alert = { ...insertAlert, id, createdAt: now };
    this.alerts.set(id, alert);
    return alert;
  }
  
  async updateAlert(id: number, alertUpdate: Partial<Alert>): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;
    
    const updatedAlert = { ...alert, ...alertUpdate };
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }
  
  async deleteAlert(id: number): Promise<boolean> {
    return this.alerts.delete(id);
  }
  
  // Initialize sample properties
  private initSampleProperties() {
    const sampleProperties: InsertProperty[] = [
      {
        title: "Modern 2 Bedroom Apartment",
        address: "2555 Main St",
        city: "San Francisco",
        state: "CA",
        zipCode: "94110",
        price: 2800,
        beds: 2,
        baths: 2,
        sqft: 1050,
        description: "Beautiful 2 bedroom apartment in the heart of the Mission District. This modern unit features stainless steel appliances, hardwood floors throughout, in-unit laundry, and a private balcony with city views.",
        images: [
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
        ],
        amenities: ["In-unit Laundry", "Dishwasher", "Pets Allowed"],
        petFriendly: true,
        availableFrom: new Date("2023-09-01"),
        leaseLength: 12,
        status: "active",
      },
      {
        title: "Luxury Studio in Berkeley",
        address: "138 Oak St",
        city: "Berkeley",
        state: "CA",
        zipCode: "94710",
        price: 1950,
        beds: 1,
        baths: 1,
        sqft: 750,
        description: "Cozy studio apartment in a great Berkeley location. Features hardwood floors, modern kitchen, and great natural light.",
        images: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
          "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
        ],
        amenities: ["In-unit Laundry", "Hardwood Floors"],
        petFriendly: false,
        availableFrom: new Date("2023-08-15"),
        leaseLength: 12,
        status: "active",
      },
      {
        title: "Spacious 2 Bedroom with Balcony",
        address: "455 Valencia St",
        city: "San Francisco",
        state: "CA",
        zipCode: "94103",
        price: 3200,
        beds: 2,
        baths: 2,
        sqft: 1100,
        description: "Beautiful 2 bedroom apartment with a private balcony in the heart of the Mission District. This modern unit features stainless steel appliances, hardwood floors throughout, and in-unit laundry.",
        images: [
          "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
        ],
        amenities: ["Pets Allowed", "Balcony", "Parking"],
        petFriendly: true,
        availableFrom: new Date("2023-09-01"),
        leaseLength: 12,
        status: "active",
      },
      {
        title: "Charming 2 Bedroom in Oakland",
        address: "742 Evergreen Terrace",
        city: "Oakland",
        state: "CA",
        zipCode: "94607",
        price: 2500,
        beds: 2,
        baths: 1,
        sqft: 950,
        description: "Charming 2 bedroom, 1 bathroom apartment in Oakland with garden access and lots of character.",
        images: [
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
        ],
        amenities: ["Pets Allowed", "Garden Access"],
        petFriendly: true,
        availableFrom: new Date("2023-08-01"),
        leaseLength: 12,
        status: "active",
      }
    ];
    
    sampleProperties.forEach(property => {
      this.createProperty(property);
    });
  }
}

export const storage = new MemStorage();
