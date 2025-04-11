import { useState } from "react";
import { Property } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Heart, Plus, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

interface PropertyCardProps {
  property: Property;
  onViewDetails: (property: Property) => void;
}

export function PropertyCard({ property, onViewDetails }: PropertyCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch if the property is a favorite
  const { data: isFavorite = false } = useQuery({
    queryKey: ["/api/favorites", property.id],
    queryFn: async () => {
      try {
        const favorites = await fetch("/api/favorites", { credentials: "include" }).then(res => res.json());
        return favorites.some((fav: Property) => fav.id === property.id);
      } catch (error) {
        return false;
      }
    },
    enabled: !!user
  });

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        await apiRequest("DELETE", `/api/favorites/${property.id}`);
      } else {
        await apiRequest("POST", "/api/favorites", { propertyId: property.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", property.id] });
      
      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        description: isFavorite 
          ? `${property.address} has been removed from your favorites.` 
          : `${property.address} has been added to your favorites.`
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isFavorite ? "remove from" : "add to"} favorites: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Calculate if the property is new (less than 3 days old)
  const isNew = () => {
    const propertyDate = new Date(property.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - propertyDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  // Calculate if lease is ending soon (for properties < 3 bedrooms)
  const isLeaseEndingSoon = () => {
    if (property.beds < 3 && property.availableFrom) {
      const availableDate = new Date(property.availableFrom);
      const now = new Date();
      const diffTime = Math.abs(availableDate.getTime() - now.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    }
    return false;
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!toggleFavoriteMutation.isPending) {
      toggleFavoriteMutation.mutate();
    }
  };

  const formatAddress = () => {
    return `${property.address}, ${property.city}, ${property.state}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden card-hover-effect animate-fade-in">
      <div className="relative">
        <Carousel className="w-full">
          <CarouselContent>
            {property.images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="overflow-hidden">
                  <img 
                    src={`${image}?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80`} 
                    alt={`${property.title} - Image ${index + 1}`} 
                    className="w-full h-52 object-cover property-image-hover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
          <CarouselNext className="right-2 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
        </Carousel>
        
        <button 
          onClick={handleToggleFavorite} 
          className={cn(
            "absolute top-3 right-3 glassmorphism rounded-full w-9 h-9 flex items-center justify-center shadow-sm transition-all duration-200",
            isFavorite ? "text-primary scale-110" : "text-neutral-600 hover:text-primary hover:scale-110"
          )}
          disabled={toggleFavoriteMutation.isPending}
        >
          <Heart className={cn(isFavorite ? "fill-current" : "")} size={18} />
        </button>
        
        {isNew() && (
          <span className="absolute bottom-3 left-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow-sm">
            New {Math.ceil((new Date().getTime() - new Date(property.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
          </span>
        )}
        
        {isLeaseEndingSoon() && (
          <span className="absolute bottom-3 left-3 bg-amber-500 text-white text-xs px-3 py-1 rounded-full shadow-sm">
            Lease ends soon
          </span>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="font-bold text-xl mb-1 text-neutral-800">
          <span className="text-primary">${property.price.toLocaleString()}</span>
          <span className="text-neutral-600 text-base font-normal">/month</span>
        </h3>
        <p className="text-neutral-700 mb-3 truncate">{formatAddress()}</p>
        
        <div className="flex items-center text-neutral-600 text-sm mb-4 border-b border-neutral-100 pb-4">
          <div className="flex items-center mr-4">
            <div className="mr-1.5 bg-primary/10 p-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M2 9V5c0-1.1.9-2 2-2h16a2 2 0 0 1 2 2v4"/><path d="M2 13v6c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2v-6"/><path d="M2 9h10"/><path d="M12 9h10"/><path d="M2 13h10"/><path d="M12 13h10"/></svg>
            </div>
            {property.beds} {property.beds === 1 ? 'bed' : 'beds'}
          </div>
          <div className="flex items-center mr-4">
            <div className="mr-1.5 bg-primary/10 p-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M9 22V12h6v10"/><path d="M2 22V9a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v13"/><path d="M11 6a4 4 0 0 0 0-8h12a4 4 0 0 0 0 8H11z"/></svg>
            </div>
            {property.baths} {property.baths === 1 ? 'bath' : 'baths'}
          </div>
          <div className="flex items-center">
            <div className="mr-1.5 bg-primary/10 p-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 3v18"/></svg>
            </div>
            {property.sqft.toLocaleString()} sqft
          </div>
        </div>
        
        {property.amenities && property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {property.amenities.slice(0, 3).map((amenity, index) => (
              <Badge key={index} variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs font-medium px-2.5">
                {amenity}
              </Badge>
            ))}
            {property.amenities.length > 3 && (
              <Badge variant="outline" className="bg-neutral-100 text-neutral-700 text-xs font-medium px-2.5">
                +{property.amenities.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex justify-between pt-1">
          <button className="text-primary bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors text-sm font-medium flex items-center">
            <Plus size={16} className="mr-1.5" /> Compare
          </button>
          <button 
            onClick={() => onViewDetails(property)} 
            className="text-primary bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors text-sm font-medium flex items-center"
          >
            View Details <ExternalLink size={16} className="ml-1.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
