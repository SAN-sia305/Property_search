import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SavedSearch } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  List, 
  Map,
  Save
} from "lucide-react";

const searchFilterSchema = z.object({
  location: z.string().optional(),
  beds: z.string().optional(),
  baths: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  filters: z.object({
    petFriendly: z.boolean().default(false),
    inUnitLaundry: z.boolean().default(false)
  })
});

type SearchFilterValues = z.infer<typeof searchFilterSchema>;

interface SearchFiltersProps {
  onSearch: (filters: SearchFilterValues) => void;
  savedSearches?: SavedSearch[];
  showSaveButton?: boolean;
}

export function SearchFilters({ onSearch, savedSearches = [], showSaveButton = true }: SearchFiltersProps) {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  
  const form = useForm<SearchFilterValues>({
    resolver: zodResolver(searchFilterSchema),
    defaultValues: {
      location: "",
      beds: "any",
      baths: "any",
      minPrice: "",
      maxPrice: "",
      filters: {
        petFriendly: false,
        inUnitLaundry: false
      }
    }
  });
  
  const saveMutation = useMutation({
    mutationFn: async (values: SearchFilterValues) => {
      const data = {
        name: `Search for ${values.location || 'All locations'}`,
        location: values.location,
        minPrice: values.minPrice ? parseInt(values.minPrice) : undefined,
        maxPrice: values.maxPrice ? parseInt(values.maxPrice) : undefined,
        beds: values.beds ? parseInt(values.beds) : undefined,
        baths: values.baths ? parseInt(values.baths) : undefined,
        filters: {
          petFriendly: values.filters.petFriendly,
          inUnitLaundry: values.filters.inUnitLaundry
        }
      };
      
      const res = await apiRequest("POST", "/api/saved-searches", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-searches"] });
      toast({
        title: "Search saved",
        description: "Your search criteria have been saved."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save search: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  const handleSubmit = (values: SearchFilterValues) => {
    onSearch(values);
  };

  const handleSaveSearch = () => {
    const values = form.getValues();
    saveMutation.mutate(values);
  };
  
  const loadSavedSearch = (search: SavedSearch) => {
    form.reset({
      location: search.location || "",
      beds: search.beds?.toString() || "any",
      baths: search.baths?.toString() || "any",
      minPrice: search.minPrice?.toString() || "",
      maxPrice: search.maxPrice?.toString() || "",
      filters: {
        petFriendly: search.filters?.petFriendly || false,
        inUnitLaundry: search.filters?.inUnitLaundry || false
      }
    });
    
    onSearch(form.getValues());
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100 mb-6 animate-fade-in">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Location</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute top-1/2 left-3 transform -translate-y-1/2 text-primary" size={18} />
                      <Input 
                        {...field} 
                        placeholder="City, Neighborhood, ZIP" 
                        className="pl-10 h-11 rounded-lg border-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="beds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Beds</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11 rounded-lg border-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="0">Studio</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="baths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Baths</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11 rounded-lg border-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="1.5">1.5+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel className="text-sm font-medium text-neutral-700">Price Range</FormLabel>
              <div className="flex">
                <FormField
                  control={form.control}
                  name="minPrice"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Min" 
                          className="rounded-l-lg rounded-r-none h-11 border-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary"
                          type="number"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="border-y border-neutral-200 flex items-center justify-center bg-neutral-50 px-3">
                  <span className="text-neutral-500">—</span>
                </div>
                <FormField
                  control={form.control}
                  name="maxPrice"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Max" 
                          className="rounded-r-lg rounded-l-none h-11 border-neutral-200 focus:border-primary focus:ring-1 focus:ring-primary"
                          type="number"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between bg-neutral-50 p-4 rounded-lg">
            <div className="flex flex-wrap gap-6 mb-4 sm:mb-0">
              <FormField
                control={form.control}
                name="filters.petFriendly"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary"
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-medium text-neutral-700 cursor-pointer">Pets allowed</FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="filters.inUnitLaundry"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary"
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-medium text-neutral-700 cursor-pointer">In-unit laundry</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex items-center space-x-3 bg-white px-3 py-1.5 rounded-md border border-neutral-200">
              <span className="text-sm font-medium text-neutral-700">View:</span>
              <Button
                type="button"
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="h-8 w-8"
              >
                <List size={16} />
              </Button>
              <Button
                type="button"
                variant={viewMode === "map" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("map")}
                className="h-8 w-8"
              >
                <Map size={16} />
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-5">
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90 text-white py-2.5 h-11 px-6 rounded-lg shadow-sm"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="mr-2"
              >
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
              Search Properties
            </Button>
            
            {showSaveButton && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSaveSearch}
                disabled={saveMutation.isPending}
                className="border-primary text-primary hover:bg-primary/5 h-11"
              >
                <Save size={16} className="mr-2" />
                Save Search
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
