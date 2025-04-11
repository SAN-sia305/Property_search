import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader, MobileNav } from "@/components/layout/mobile-nav";
import { PropertyList } from "@/components/property/property-list";

export default function FavoritesPage() {
  const [sortOption, setSortOption] = useState("date-newest");
  
  // Fetch favorites
  const { data: favorites = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/favorites"],
    queryFn: async () => {
      const res = await fetch("/api/favorites", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch favorites");
      return res.json();
    }
  });
  
  // Sort favorites based on selected option
  const sortedFavorites = [...favorites].sort((a, b) => {
    switch (sortOption) {
      case "date-oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "price-low-high":
        return a.price - b.price;
      case "price-high-low":
        return b.price - a.price;
      case "date-newest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
  
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 min-h-screen">
        <MobileHeader />
        
        <section className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-neutral-800">Favorites</h1>
            <p className="text-neutral-600">Properties you've saved</p>
          </header>
          
          {/* Sort & Filter Options */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="mb-4 sm:mb-0">
              <span className="text-neutral-600">
                {favorites.length} {favorites.length === 1 ? 'property' : 'properties'} saved
              </span>
            </div>
            
            <div className="flex items-center">
              <span className="text-sm text-neutral-600 mr-2">Sort by:</span>
              <select 
                className="px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                value={sortOption}
                onChange={handleSortChange}
              >
                <option value="date-newest">Date saved: Newest first</option>
                <option value="date-oldest">Date saved: Oldest first</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
              </select>
            </div>
          </div>
          
          {/* Favorites Grid */}
          <PropertyList 
            properties={sortedFavorites} 
            isLoading={isLoading}
            emptyMessage="You haven't saved any properties yet" 
          />
        </section>
        
        <MobileNav />
      </main>
    </div>
  );
}
