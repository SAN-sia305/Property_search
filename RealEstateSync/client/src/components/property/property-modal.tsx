import { useState } from "react";
import { Property } from "@shared/schema";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Check, 
  Plus, 
  Phone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  Dialog, 
  DialogContent, 
  DialogOverlay 
} from "@/components/ui/dialog";

interface PropertyModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function PropertyModal({ 
  property, 
  isOpen, 
  onClose,
  onNext,
  onPrevious
}: PropertyModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // If no property, don't render
  if (!property) return null;
  
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
    enabled: !!user && isOpen
  });

  // Fetch similar properties
  const { data: similarProperties = [] } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      const allProperties = await fetch("/api/properties", { credentials: "include" }).then(res => res.json());
      // Filter for properties with similar price range (±20%) and same bedrooms
      return allProperties
        .filter((p: Property) => 
          p.id !== property.id && 
          p.beds === property.beds && 
          p.price >= property.price * 0.8 && 
          p.price <= property.price * 1.2
        )
        .slice(0, 2); // Just get 2 similar properties
    },
    enabled: isOpen
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

  const handleToggleFavorite = () => {
    if (!toggleFavoriteMutation.isPending) {
      toggleFavoriteMutation.mutate();
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const formatAddress = () => {
    return `${property.address}, ${property.city}, ${property.state}`;
  };

  // Calculate price per square foot
  const pricePerSqft = (property.price / property.sqft).toFixed(2);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="backdrop-blur-sm bg-black/20" />
      <DialogContent className="p-0 sm:max-w-2xl lg:max-w-4xl h-[90vh] overflow-hidden flex flex-col rounded-xl shadow-xl border-0 animate-slide-up">
        <div className="flex flex-col h-full">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-5 border-b border-neutral-200">
            <h2 className="text-xl font-semibold text-primary">Property Details</h2>
            <button className="text-neutral-500 hover:text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors p-2 rounded-full" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
          
          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {/* Image Gallery */}
            <div className="relative">
              <img 
                src={`${property.images[currentImageIndex]}?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80`} 
                alt={`${property.title} - Image ${currentImageIndex + 1}`} 
                className="w-full h-80 sm:h-96 object-cover transition-opacity duration-300"
              />
              
              {/* Gallery Navigation */}
              <button 
                className="absolute top-1/2 left-4 transform -translate-y-1/2 w-11 h-11 rounded-full glassmorphism flex items-center justify-center shadow-md transition-transform hover:scale-110"
                onClick={handlePrevImage}
              >
                <ChevronLeft size={22} className="text-neutral-700" />
              </button>
              <button 
                className="absolute top-1/2 right-4 transform -translate-y-1/2 w-11 h-11 rounded-full glassmorphism flex items-center justify-center shadow-md transition-transform hover:scale-110"
                onClick={handleNextImage}
              >
                <ChevronRight size={22} className="text-neutral-700" />
              </button>
              
              {/* Image Count */}
              <div className="absolute bottom-4 right-4 glassmorphism text-neutral-900 text-sm px-4 py-1.5 rounded-full shadow-sm font-medium">
                <span>{currentImageIndex + 1}/{property.images.length}</span>
              </div>
              
              {/* Favorite Button */}
              <button 
                className={cn(
                  "absolute top-4 right-4 glassmorphism rounded-full w-11 h-11 flex items-center justify-center shadow-md transition-all duration-200",
                  isFavorite ? "text-primary scale-110" : "text-neutral-700 hover:text-primary hover:scale-110"
                )}
                onClick={handleToggleFavorite}
                disabled={toggleFavoriteMutation.isPending}
              >
                <Heart className={cn(isFavorite ? "fill-current" : "")} size={20} />
              </button>
              
              {/* Property navigation */}
              {onPrevious && (
                <button 
                  className="absolute top-4 left-4 glassmorphism rounded-full w-11 h-11 flex items-center justify-center shadow-md text-neutral-700 hover:text-primary transition-all duration-200 hover:scale-110"
                  onClick={onPrevious}
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              
              {onNext && (
                <button 
                  className="absolute top-4 left-20 glassmorphism rounded-full w-11 h-11 flex items-center justify-center shadow-md text-neutral-700 hover:text-primary transition-all duration-200 hover:scale-110"
                  onClick={onNext}
                >
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
            
            {/* Property Info */}
            <div className="p-6 sm:p-8">
              <div className="mb-8 animate-fade-in">
                <h1 className="text-3xl font-bold mb-2 flex items-baseline">
                  <span className="text-primary">${property.price.toLocaleString()}</span>
                  <span className="text-neutral-600 text-lg font-medium ml-1">/month</span>
                </h1>
                <p className="text-neutral-700 text-lg">{formatAddress()}</p>
                
                <div className="flex flex-wrap items-center mt-4 bg-primary/5 p-4 rounded-xl">
                  <div className="flex items-center mr-8 mb-2 sm:mb-0">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M2 9V5c0-1.1.9-2 2-2h16a2 2 0 0 1 2 2v4"/><path d="M2 13v6c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2v-6"/><path d="M2 9h10"/><path d="M12 9h10"/><path d="M2 13h10"/><path d="M12 13h10"/></svg>
                    </div>
                    <span className="text-neutral-800 font-medium">{property.beds} {property.beds === 1 ? 'bed' : 'beds'}</span>
                  </div>
                  <div className="flex items-center mr-8 mb-2 sm:mb-0">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M9 22V12h6v10"/><path d="M2 22V9a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v13"/><path d="M11 6a4 4 0 0 0 0-8h12a4 4 0 0 0 0 8H11z"/></svg>
                    </div>
                    <span className="text-neutral-800 font-medium">{property.baths} {property.baths === 1 ? 'bath' : 'baths'}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 3v18"/></svg>
                    </div>
                    <span className="text-neutral-800 font-medium">{property.sqft.toLocaleString()} sqft</span>
                  </div>
                </div>
              </div>
              
              {/* Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8 animate-fade-in">
                <div className="bg-neutral-50 p-4 rounded-xl">
                  <h3 className="text-sm font-medium text-neutral-500 mb-1">Rent/Month</h3>
                  <p className="font-bold text-lg">${property.price.toLocaleString()}</p>
                </div>
                <div className="bg-neutral-50 p-4 rounded-xl">
                  <h3 className="text-sm font-medium text-neutral-500 mb-1">Rent/Sq.Ft</h3>
                  <p className="font-bold text-lg">${pricePerSqft}</p>
                </div>
                {property.leaseLength && (
                  <div className="bg-neutral-50 p-4 rounded-xl">
                    <h3 className="text-sm font-medium text-neutral-500 mb-1">Lease Term</h3>
                    <p className="font-bold text-lg">{property.leaseLength} months</p>
                  </div>
                )}
                {property.availableFrom && (
                  <div className="bg-neutral-50 p-4 rounded-xl">
                    <h3 className="text-sm font-medium text-neutral-500 mb-1">Available From</h3>
                    <p className="font-bold text-lg">{new Date(property.availableFrom).toLocaleDateString()}</p>
                  </div>
                )}
                <div className="bg-neutral-50 p-4 rounded-xl">
                  <h3 className="text-sm font-medium text-neutral-500 mb-1">Status</h3>
                  <p className="font-bold text-lg capitalize">{property.status}</p>
                </div>
              </div>
              
              {/* Description */}
              <div className="mb-8 animate-fade-in">
                <h3 className="text-xl font-semibold mb-3 text-neutral-800">Description</h3>
                <div className="text-neutral-700 bg-white p-5 rounded-xl border border-neutral-100 leading-relaxed">
                  {property.description}
                </div>
              </div>
              
              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="mb-8 animate-fade-in">
                  <h3 className="text-xl font-semibold mb-3 text-neutral-800">Amenities</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-5 rounded-xl border border-neutral-100">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center text-neutral-700">
                        <div className="bg-green-50 p-1.5 rounded-full mr-3">
                          <Check size={16} className="text-green-600" />
                        </div>
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Similar Properties */}
              {similarProperties.length > 0 && (
                <div className="mb-6 animate-fade-in">
                  <h3 className="text-xl font-semibold mb-4 text-neutral-800">Similar Properties</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {similarProperties.map((similar: Property) => (
                      <div key={similar.id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="overflow-hidden">
                          <img 
                            src={`${similar.images[0]}?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80`}
                            alt={similar.title} 
                            className="w-full h-32 object-cover property-image-hover" 
                          />
                        </div>
                        <div className="p-3">
                          <p className="font-semibold text-primary">${similar.price.toLocaleString()}<span className="text-neutral-600 text-sm font-normal">/month</span></p>
                          <p className="text-sm text-neutral-600 truncate">{similar.address}</p>
                          <div className="flex items-center text-xs text-neutral-500 mt-1">
                            <span className="mr-2">{similar.beds} beds</span>
                            <span className="mr-2">{similar.baths} baths</span>
                            <span>{similar.sqft.toLocaleString()} sqft</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Modal Footer */}
          <div className="border-t border-neutral-200 p-5">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button className="flex-1 bg-primary hover:bg-primary/90 text-white py-3.5 px-5 rounded-xl transition duration-300 flex items-center justify-center shadow-sm font-medium">
                <Phone size={18} className="mr-2.5" /> Contact Property
              </button>
              <button className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 py-3.5 px-5 rounded-xl transition duration-300 flex items-center justify-center shadow-sm font-medium">
                <Plus size={18} className="mr-2.5" /> Compare
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
