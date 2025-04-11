import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader, MobileNav } from "@/components/layout/mobile-nav";
import { PropertyList } from "@/components/property/property-list";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { MapPin, AlertCircle, Loader2 } from "lucide-react";

interface Coordinates {
  latitude: number;
  longitude: number;
}

// Function to calculate distance between two coordinates in miles
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function NearMePage() {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [radius, setRadius] = useState(5); // Default search radius in miles
  
  // Fetch properties
  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      const res = await fetch("/api/properties", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch properties");
      return res.json();
    }
  });
  
  // Function to get user's current location
  const getUserLocation = () => {
    setIsGettingLocation(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsGettingLocation(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setIsGettingLocation(false);
      },
      (error) => {
        let errorMessage;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access was denied. Please enable location services.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "The request to get user location timed out.";
            break;
          default:
            errorMessage = "An unknown error occurred while trying to access your location.";
            break;
        }
        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };
  
  // Filter properties by proximity to user's location
  const nearbyProperties = location
    ? properties.filter(property => {
        // For a real app, you'd have actual coordinates for each property
        // Here we're extracting them from mock data for demonstration
        
        // Mock coordinates based on property address (in a real app, these would come from a geocoding service)
        // Using property ID as a seed to generate somewhat consistent coordinates
        const propertyLat = 37.7749 + (property.id * 0.01 % 0.2);
        const propertyLng = -122.4194 + (property.id * 0.015 % 0.3);
        
        const distance = calculateDistance(
          location.latitude, 
          location.longitude,
          propertyLat,
          propertyLng
        );
        
        // Add distance property for sorting
        (property as any).distance = distance;
        
        return distance <= radius;
      }).sort((a, b) => (a as any).distance - (b as any).distance)
    : [];
  
  // Effect to automatically request location when page loads
  useEffect(() => {
    getUserLocation();
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 min-h-screen">
        <MobileHeader />
        
        <section className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-neutral-800">Near Me</h1>
            <p className="text-neutral-600">Find properties in your vicinity</p>
          </header>
          
          {/* Location Controls */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-1">Your Location</h3>
                {isGettingLocation ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Getting your location...</span>
                  </div>
                ) : location ? (
                  <div className="flex items-center text-neutral-700">
                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                    <span>
                      {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </span>
                  </div>
                ) : (
                  <div className="text-neutral-600">No location detected</div>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-full md:w-auto">
                  <label htmlFor="radius" className="block text-sm font-medium mb-1">Search Radius</label>
                  <select 
                    id="radius"
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-sm"
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                  >
                    <option value="1">1 mile</option>
                    <option value="3">3 miles</option>
                    <option value="5">5 miles</option>
                    <option value="10">10 miles</option>
                    <option value="25">25 miles</option>
                  </select>
                </div>
                
                <Button 
                  onClick={getUserLocation}
                  disabled={isGettingLocation}
                  className="mt-6"
                >
                  {isGettingLocation ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Getting Location
                    </>
                  ) : (
                    <>
                      <MapPin className="mr-2 h-4 w-4" />
                      Update Location
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Error Alert */}
          {locationError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Location Error</AlertTitle>
              <AlertDescription>{locationError}</AlertDescription>
            </Alert>
          )}
          
          {/* Map Placeholder (in a real application, you would integrate with a mapping API) */}
          {location && (
            <div className="bg-neutral-100 rounded-lg mb-6 relative overflow-hidden">
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-neutral-600 mb-2">Map would display here with {nearbyProperties.length} nearby properties</p>
                  <p className="text-sm text-neutral-500">Centered at {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</p>
                </div>
                <div className="absolute inset-0 p-4">
                  <div className="w-6 h-6 bg-primary rounded-full absolute" style={{ 
                    left: 'calc(50% - 12px)', 
                    top: 'calc(50% - 12px)',
                    boxShadow: '0 0 0 8px rgba(51, 102, 255, 0.2)'
                  }}></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Nearby Properties */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Nearby Properties</h2>
            
            {!location && !locationError && !isGettingLocation ? (
              <Alert className="mb-6">
                <AlertTitle>Location Required</AlertTitle>
                <AlertDescription>
                  To see properties near you, please enable location services and click "Update Location".
                </AlertDescription>
              </Alert>
            ) : null}
            
            {location && !isLoading && nearbyProperties.length === 0 ? (
              <Alert className="mb-6">
                <AlertTitle>No Properties Found</AlertTitle>
                <AlertDescription>
                  No properties found within {radius} miles of your location. Try increasing your search radius.
                </AlertDescription>
              </Alert>
            ) : null}
            
            {location && (
              <PropertyList 
                properties={nearbyProperties} 
                isLoading={isLoading || isGettingLocation}
                emptyMessage={`No properties found within ${radius} miles of your location`} 
              />
            )}
          </div>
        </section>
        
        <MobileNav />
      </main>
    </div>
  );
}
