import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertProjectSchema } from "@shared/schema";
import { useLocation } from "wouter";
import BottomNavigation from "@/components/BottomNavigation";

const categories = [
  { value: 'cleanup', label: 'Cleanup' },
  { value: 'tree_planting', label: 'Tree Planting' },
  { value: 'education', label: 'Education' },
  { value: 'construction', label: 'Construction' },
  { value: 'food_distribution', label: 'Food Distribution' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'disaster_relief', label: 'Disaster Relief' },
  { value: 'community_service', label: 'Community Service' },
];

export default function CreateProject() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const form = useForm({
    resolver: zodResolver(insertProjectSchema.extend({
      dateTime: insertProjectSchema.shape.dateTime.transform((val) => new Date(val)),
    })),
    defaultValues: {
      title: '',
      description: '',
      category: 'cleanup' as const,
      location: '',
      dateTime: new Date(),
      duration: 4,
      maxVolunteers: 50,
      requirements: '',
      provided: '',
      contactPerson: '',
      contactPhone: '',
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/projects', data);
      return response.json();
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Success!",
        description: "Your project has been created successfully.",
      });
      setLocation(`/project/${project.id}`);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createProjectMutation.mutate(data);
  };

  if (authLoading) {
    return (
      <div className="max-w-sm mx-auto bg-background min-h-screen">
        <div className="animate-pulse p-4">
          <div className="h-8 bg-muted rounded mb-4"></div>
          <div className="space-y-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto bg-background min-h-screen">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-4 flex items-center justify-between">
        <button 
          onClick={() => setLocation('/')} 
          className="flex items-center space-x-2 text-muted-foreground"
          data-testid="button-cancel"
        >
          <i className="fas fa-times"></i>
          <span>Cancel</span>
        </button>
        <h1 className="text-lg font-semibold text-foreground">Create Project</h1>
        <Button
          type="submit"
          form="create-project-form"
          disabled={createProjectMutation.isPending}
          data-testid="button-save"
        >
          {createProjectMutation.isPending ? 'Saving...' : 'Save'}
        </Button>
      </header>

      <Form {...form}>
        <form 
          id="create-project-form" 
          onSubmit={form.handleSubmit(onSubmit)} 
          className="px-4 py-4 pb-20 space-y-6"
        >
          {/* Project Image Upload Placeholder */}
          <div>
            <FormLabel>Project Image</FormLabel>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/30">
              <i className="fas fa-camera text-3xl text-muted-foreground mb-2"></i>
              <p className="text-sm text-muted-foreground mb-2">Add a project photo</p>
              <Button type="button" variant="outline" size="sm" data-testid="button-choose-image">
                Choose Image
              </Button>
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Beach Cleanup Drive" 
                      {...field} 
                      data-testid="input-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={4}
                      placeholder="Describe your project and its impact..."
                      {...field}
                      data-testid="textarea-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Location & Time */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-foreground">Location & Time</h3>
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter address or landmark" 
                      {...field}
                      data-testid="input-location"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date & Time</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local"
                        {...field}
                        value={field.value ? new Date(field.value.getTime() - field.value.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                        data-testid="input-datetime"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (hours)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        max="24"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        data-testid="input-duration"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Project Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-foreground">Project Settings</h3>
            
            <FormField
              control={form.control}
              name="maxVolunteers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Volunteers</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1"
                      max="1000"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      data-testid="input-max-volunteers"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What to Bring</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Gloves, water bottle, comfortable shoes" 
                      {...field}
                      data-testid="input-requirements"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="provided"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provided by Organizer</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Tools, lunch, first aid kit" 
                      {...field}
                      data-testid="input-provided"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-foreground">Contact Information</h3>
            
            <FormField
              control={form.control}
              name="contactPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Your name" 
                      {...field}
                      data-testid="input-contact-person"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input 
                      type="tel"
                      placeholder="+91 98765 43210" 
                      {...field}
                      data-testid="input-contact-phone"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>

      <BottomNavigation activeTab="create" />
    </div>
  );
}
