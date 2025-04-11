import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Alert, InsertAlert } from "@shared/schema";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader, MobileNav } from "@/components/layout/mobile-nav";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Bell, BellOff, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Schema for alert creation/edit
const alertSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  location: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  beds: z.string().optional(),
  baths: z.string().optional(),
  enabled: z.boolean().default(true),
  filters: z.object({
    petFriendly: z.boolean().default(false),
    inUnitLaundry: z.boolean().default(false)
  }).default({})
});

type AlertFormValues = z.infer<typeof alertSchema>;

export default function AlertsPage() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  
  // Fetch alerts
  const { data: alerts = [], isLoading } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
    queryFn: async () => {
      const res = await fetch("/api/alerts", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch alerts");
      return res.json();
    }
  });
  
  // Form for creating/editing alerts
  const form = useForm<AlertFormValues>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      name: "",
      location: "",
      minPrice: "",
      maxPrice: "",
      beds: "",
      baths: "",
      enabled: true,
      filters: {
        petFriendly: false,
        inUnitLaundry: false
      }
    }
  });
  
  // Create alert mutation
  const createAlertMutation = useMutation({
    mutationFn: async (values: AlertFormValues) => {
      const data = {
        ...values,
        minPrice: values.minPrice ? parseInt(values.minPrice) : undefined,
        maxPrice: values.maxPrice ? parseInt(values.maxPrice) : undefined,
        beds: values.beds ? parseInt(values.beds) : undefined,
        baths: values.baths ? parseInt(values.baths) : undefined
      };
      
      const res = await apiRequest("POST", "/api/alerts", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Alert created",
        description: "You will be notified when new properties match your criteria."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create alert: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Update alert mutation
  const updateAlertMutation = useMutation({
    mutationFn: async ({ id, values }: { id: number; values: AlertFormValues }) => {
      const data = {
        ...values,
        minPrice: values.minPrice ? parseInt(values.minPrice) : undefined,
        maxPrice: values.maxPrice ? parseInt(values.maxPrice) : undefined,
        beds: values.beds ? parseInt(values.beds) : undefined,
        baths: values.baths ? parseInt(values.baths) : undefined
      };
      
      const res = await apiRequest("PATCH", `/api/alerts/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      setIsCreateDialogOpen(false);
      setEditingAlert(null);
      form.reset();
      toast({
        title: "Alert updated",
        description: "Your alert criteria have been updated."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update alert: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Delete alert mutation
  const deleteAlertMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/alerts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Alert deleted",
        description: "Your alert has been removed."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete alert: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Toggle alert enabled status
  const toggleAlertMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: number; enabled: boolean }) => {
      const res = await apiRequest("PATCH", `/api/alerts/${id}`, { enabled });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update alert: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  const handleSubmit = (values: AlertFormValues) => {
    if (editingAlert) {
      updateAlertMutation.mutate({ id: editingAlert.id, values });
    } else {
      createAlertMutation.mutate(values);
    }
  };
  
  const handleEditAlert = (alert: Alert) => {
    setEditingAlert(alert);
    form.reset({
      name: alert.name,
      location: alert.location || "",
      minPrice: alert.minPrice?.toString() || "",
      maxPrice: alert.maxPrice?.toString() || "",
      beds: alert.beds?.toString() || "",
      baths: alert.baths?.toString() || "",
      enabled: alert.enabled,
      filters: {
        petFriendly: alert.filters?.petFriendly || false,
        inUnitLaundry: alert.filters?.inUnitLaundry || false
      }
    });
    setIsCreateDialogOpen(true);
  };
  
  const handleToggleAlert = (alert: Alert) => {
    toggleAlertMutation.mutate({
      id: alert.id,
      enabled: !alert.enabled
    });
  };
  
  const handleDeleteAlert = (id: number) => {
    if (window.confirm("Are you sure you want to delete this alert?")) {
      deleteAlertMutation.mutate(id);
    }
  };
  
  const handleOpenCreateDialog = () => {
    setEditingAlert(null);
    form.reset({
      name: "",
      location: "",
      minPrice: "",
      maxPrice: "",
      beds: "",
      baths: "",
      enabled: true,
      filters: {
        petFriendly: false,
        inUnitLaundry: false
      }
    });
    setIsCreateDialogOpen(true);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 min-h-screen">
        <MobileHeader />
        
        <section className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <header className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Alerts</h1>
              <p className="text-neutral-600">Get notified when new properties match your criteria</p>
            </div>
            
            <Button onClick={handleOpenCreateDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Alert
            </Button>
          </header>
          
          {/* Alerts List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-6 bg-neutral-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <div className="h-6 bg-neutral-200 rounded w-20"></div>
                      <div className="h-6 bg-neutral-200 rounded w-20"></div>
                      <div className="h-6 bg-neutral-200 rounded w-20"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No alerts configured</CardTitle>
                <CardDescription>
                  Create alerts to get notified when new properties match your criteria
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={handleOpenCreateDialog}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create your first alert
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Card key={alert.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{alert.name}</CardTitle>
                        <CardDescription>
                          Created {new Date(alert.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleToggleAlert(alert)}
                        >
                          {alert.enabled ? <Bell size={16} /> : <BellOff size={16} />}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditAlert(alert)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteAlert(alert.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 text-sm">
                      {alert.location && <span className="bg-neutral-100 px-2 py-1 rounded-md">{alert.location}</span>}
                      {alert.beds && <span className="bg-neutral-100 px-2 py-1 rounded-md">{alert.beds}+ beds</span>}
                      {alert.baths && <span className="bg-neutral-100 px-2 py-1 rounded-md">{alert.baths}+ baths</span>}
                      {alert.minPrice && alert.maxPrice && (
                        <span className="bg-neutral-100 px-2 py-1 rounded-md">
                          ${alert.minPrice} - ${alert.maxPrice}
                        </span>
                      )}
                      {alert.filters?.petFriendly && <span className="bg-neutral-100 px-2 py-1 rounded-md">Pets allowed</span>}
                      {alert.filters?.inUnitLaundry && <span className="bg-neutral-100 px-2 py-1 rounded-md">In-unit laundry</span>}
                      <span className={`px-2 py-1 rounded-md ${alert.enabled ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-600'}`}>
                        {alert.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Create/Edit Alert Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingAlert ? 'Edit Alert' : 'Create Alert'}</DialogTitle>
                <DialogDescription>
                  {editingAlert 
                    ? 'Modify your alert criteria to get notifications for properties that match your preferences.'
                    : 'Get notified when new properties are listed that match your criteria.'}
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alert Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter a name for this alert" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="City, Neighborhood, ZIP" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="beds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Beds</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
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
                          <FormLabel>Baths</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
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
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="minPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min Price</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Min" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="maxPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Price</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Max" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="filters.petFriendly"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Pets Allowed</FormLabel>
                          <FormDescription>Show only pet-friendly properties</FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="filters.inUnitLaundry"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">In-unit Laundry</FormLabel>
                          <FormDescription>Show only properties with laundry in unit</FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="enabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Notifications</FormLabel>
                          <FormDescription>Enable notifications for this alert</FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={createAlertMutation.isPending || updateAlertMutation.isPending}
                    >
                      {editingAlert ? 'Update Alert' : 'Create Alert'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </section>
        
        <MobileNav />
      </main>
    </div>
  );
}
