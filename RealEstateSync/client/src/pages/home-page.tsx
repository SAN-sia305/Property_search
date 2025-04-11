import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader, MobileNav } from "@/components/layout/mobile-nav";
import { PropertyList } from "@/components/property/property-list";
import { ActivityCard } from "@/components/dashboard/activity-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { useAuth } from "@/hooks/use-auth";
import { Activity, Property } from "@shared/schema";
import { Link } from "wouter";
import { 
  Home, 
  Search, 
  Heart, 
  Bell 
} from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  
  // Fetch recent activities
  const { data: activities = [], isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
    queryFn: async () => {
      const res = await fetch("/api/activities?limit=3", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch activities");
      return res.json();
    }
  });
  
  // Fetch favorites count
  const { data: favorites = [], isLoading: favoritesLoading } = useQuery<Property[]>({
    queryKey: ["/api/favorites"],
    queryFn: async () => {
      const res = await fetch("/api/favorites", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch favorites");
      return res.json();
    }
  });
  
  // Fetch saved searches count
  const { data: savedSearches = [], isLoading: savedSearchesLoading } = useQuery({
    queryKey: ["/api/saved-searches"],
    queryFn: async () => {
      const res = await fetch("/api/saved-searches", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch saved searches");
      return res.json();
    }
  });
  
  // Fetch alerts count
  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/alerts"],
    queryFn: async () => {
      const res = await fetch("/api/alerts", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch alerts");
      return res.json();
    }
  });
  
  // Fetch suggested properties
  const { data: properties = [], isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      const res = await fetch("/api/properties", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch properties");
      return res.json();
    }
  });

  // Get limited number of suggested properties
  const suggestedProperties = properties.slice(0, 4);

  return (
    <div id="app" className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 min-h-screen">
        <MobileHeader />
        
        <section id="dashboardView" className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-neutral-800">Dashboard</h1>
            <p className="text-neutral-600">Welcome back, {user?.name || user?.username}!</p>
          </header>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatCard 
              title="Saved Properties" 
              value={favorites.length} 
              icon={<Heart className="text-primary" />} 
              loading={favoritesLoading} 
            />
            
            <StatCard 
              title="Saved Searches" 
              value={savedSearches.length} 
              icon={<Search className="text-primary" />} 
              loading={savedSearchesLoading} 
            />
            
            <StatCard 
              title="New Alerts" 
              value={alerts.filter(a => a.enabled).length} 
              icon={<Bell className="text-primary" />} 
              loading={alertsLoading} 
            />
          </div>
          
          {/* Recent Activity */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <Link href="/activities" className="text-primary hover:text-primary-600 text-sm">
                View All
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
              {activitiesLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="p-4 border-b border-neutral-200 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-neutral-200 animate-pulse mr-3" />
                    <div className="flex-1">
                      <div className="h-4 bg-neutral-200 rounded animate-pulse w-48 mb-2" />
                      <div className="h-3 bg-neutral-200 rounded animate-pulse w-32" />
                    </div>
                    <div className="h-3 bg-neutral-200 rounded animate-pulse w-20" />
                  </div>
                ))
              ) : activities.length > 0 ? (
                activities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))
              ) : (
                <div className="p-6 text-center">
                  <p className="text-neutral-600">No recent activity</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Suggested Properties */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Suggested Properties</h2>
              <Link href="/search" className="text-primary hover:text-primary-600 text-sm">
                View All
              </Link>
            </div>
            
            <PropertyList 
              properties={suggestedProperties} 
              isLoading={propertiesLoading}
              emptyMessage="No suggested properties yet" 
            />
          </div>
        </section>
        
        <MobileNav />
      </main>
    </div>
  );
}
