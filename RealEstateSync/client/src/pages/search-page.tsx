import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader, MobileNav } from "@/components/layout/mobile-nav";
import { PropertyList } from "@/components/property/property-list";
import { SearchFilters } from "@/components/search/search-filters";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SearchFilters {
  location?: string;
  beds?: string;
  baths?: string;
  minPrice?: string;
  maxPrice?: string;
  filters?: {
    petFriendly: boolean;
    inUnitLaundry: boolean;
  };
}

export default function SearchPage() {
  const [searchMode, setSearchMode] = useState<"new" | "saved">("new");
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({});
  const [sortOption, setSortOption] = useState("recommended");
  
  // Fetch properties
  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      const res = await fetch("/api/properties", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch properties");
      return res.json();
    }
  });
  
  // Fetch saved searches
  const { data: savedSearches = [] } = useQuery({
    queryKey: ["/api/saved-searches"],
    queryFn: async () => {
      const res = await fetch("/api/saved-searches", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch saved searches");
      return res.json();
    }
  });
  
  // Filter properties based on search criteria
  const filteredProperties = properties.filter((property) => {
    // If no filters are applied, return all properties
    if (!activeFilters.location && 
        !activeFilters.beds && 
        !activeFilters.baths && 
        !activeFilters.minPrice && 
        !activeFilters.maxPrice && 
        !activeFilters.filters) {
      return true;
    }
    
    // Filter by location
    if (activeFilters.location && 
        !(property.address.toLowerCase().includes(activeFilters.location.toLowerCase()) ||
          property.city.toLowerCase().includes(activeFilters.location.toLowerCase()) ||
          property.state.toLowerCase().includes(activeFilters.location.toLowerCase()) ||
          property.zipCode.toLowerCase().includes(activeFilters.location.toLowerCase()))) {
      return false;
    }
    
    // Filter by beds
    if (activeFilters.beds && activeFilters.beds !== "any" && parseInt(activeFilters.beds) > property.beds) {
      return false;
    }
    
    // Filter by baths
    if (activeFilters.baths && activeFilters.baths !== "any" && parseFloat(activeFilters.baths) > property.baths) {
      return false;
    }
    
    // Filter by price range
    if (activeFilters.minPrice && parseInt(activeFilters.minPrice) > property.price) {
      return false;
    }
    
    if (activeFilters.maxPrice && parseInt(activeFilters.maxPrice) < property.price) {
      return false;
    }
    
    // Filter by amenities
    if (activeFilters.filters?.petFriendly && !property.petFriendly) {
      return false;
    }
    
    if (activeFilters.filters?.inUnitLaundry && 
        !property.amenities.some(amenity => 
          amenity.toLowerCase().includes('laundry') || 
          amenity.toLowerCase().includes('washer')
        )) {
      return false;
    }
    
    return true;
  });
  
  // Sort properties based on selected option
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortOption) {
      case "price-low-high":
        return a.price - b.price;
      case "price-high-low":
        return b.price - a.price;
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "recommended":
      default:
        // For recommended, prioritize properties that match more criteria
        // This is a simple implementation - in a real app, this would be more sophisticated
        const aScore = (a.petFriendly ? 1 : 0) + 
                       (a.amenities.length > 3 ? 1 : 0) + 
                       (a.sqft > 900 ? 1 : 0);
        const bScore = (b.petFriendly ? 1 : 0) + 
                       (b.amenities.length > 3 ? 1 : 0) + 
                       (b.sqft > 900 ? 1 : 0);
        return bScore - aScore;
    }
  });
  
  const handleSearch = (filters: SearchFilters) => {
    setActiveFilters(filters);
  };
  
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
            <h1 className="text-2xl font-bold text-neutral-800">Search & Compare</h1>
            <p className="text-neutral-600">Find your perfect rental property</p>
          </header>
          
          {/* Search Bar & Filters */}
          <SearchFilters 
            onSearch={handleSearch} 
            savedSearches={savedSearches}
            showSaveButton={searchMode === "new"}
          />
          
          {/* Toggle for Saved vs New */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex">
              <Button
                variant={searchMode === "new" ? "default" : "outline"}
                className={searchMode === "new" ? "" : "border border-neutral-300 text-neutral-700"}
                onClick={() => setSearchMode("new")}
              >
                New Search
              </Button>
              <Button
                variant={searchMode === "saved" ? "default" : "outline"}
                className={`ml-px ${searchMode === "saved" ? "" : "border border-neutral-300 text-neutral-700"}`}
                onClick={() => setSearchMode("saved")}
              >
                Saved Searches
              </Button>
            </div>
            
            <div className="flex items-center">
              <span className="text-sm text-neutral-600 mr-2">Sort by:</span>
              <select 
                className="px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                value={sortOption}
                onChange={handleSortChange}
              >
                <option value="recommended">Recommended</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
          
          {/* Search Results or Saved Searches */}
          {searchMode === "new" ? (
            <PropertyList 
              properties={sortedProperties} 
              isLoading={isLoading}
              emptyMessage="No properties match your search criteria" 
            />
          ) : (
            <div>
              {savedSearches.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-neutral-200">
                  <h3 className="text-lg font-medium text-neutral-700 mb-2">No saved searches</h3>
                  <p className="text-neutral-500">Save your search criteria to quickly access them later.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedSearches.map((search) => (
                    <div key={search.id} className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">{search.name}</h3>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Load</Button>
                          <Button variant="destructive" size="sm">Delete</Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-neutral-600">
                        {search.location && <span className="bg-neutral-100 px-2 py-1 rounded">{search.location}</span>}
                        {search.beds && <span className="bg-neutral-100 px-2 py-1 rounded">{search.beds}+ beds</span>}
                        {search.baths && <span className="bg-neutral-100 px-2 py-1 rounded">{search.baths}+ baths</span>}
                        {search.minPrice && search.maxPrice && (
                          <span className="bg-neutral-100 px-2 py-1 rounded">
                            ${search.minPrice} - ${search.maxPrice}
                          </span>
                        )}
                        {search.filters?.petFriendly && <span className="bg-neutral-100 px-2 py-1 rounded">Pets allowed</span>}
                        {search.filters?.inUnitLaundry && <span className="bg-neutral-100 px-2 py-1 rounded">In-unit laundry</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
        
        <MobileNav />
      </main>
    </div>
  );
}
