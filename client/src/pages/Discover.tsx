import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProjectCard from "@/components/ProjectCard";
import BottomNavigation from "@/components/BottomNavigation";
import type { ProjectWithDetails } from "@shared/schema";

const categories = [
  { id: 'all', label: 'All Categories', icon: 'fas fa-th' },
  { id: 'cleanup', label: 'Cleanup', icon: 'fas fa-trash-alt' },
  { id: 'tree_planting', label: 'Tree Planting', icon: 'fas fa-seedling' },
  { id: 'education', label: 'Education', icon: 'fas fa-graduation-cap' },
  { id: 'construction', label: 'Construction', icon: 'fas fa-hammer' },
  { id: 'food_distribution', label: 'Food Distribution', icon: 'fas fa-utensils' },
  { id: 'healthcare', label: 'Healthcare', icon: 'fas fa-heartbeat' },
  { id: 'disaster_relief', label: 'Disaster Relief', icon: 'fas fa-hands-helping' },
  { id: 'community_service', label: 'Community Service', icon: 'fas fa-users' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'date', label: 'Event Date' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'urgent', label: 'Urgent' },
];

export default function Discover() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showMap, setShowMap] = useState(false);

  const { data: projects = [], isLoading } = useQuery<ProjectWithDetails[]>({
    queryKey: ['/api/projects', { category: selectedCategory, search: searchQuery, sort: sortBy }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/projects?${params}`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      return response.json();
    },
  });

  return (
    <div className="max-w-sm mx-auto bg-background min-h-screen">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <i className="fas fa-search text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Discover</h1>
              <p className="text-xs text-muted-foreground">Find volunteer opportunities</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowMap(!showMap)}
              data-testid="button-toggle-map"
            >
              <i className={`fas ${showMap ? 'fa-list' : 'fa-map'} mr-1`}></i>
              {showMap ? 'List' : 'Map'}
            </Button>
          </div>
        </div>
      </header>

      <div className="pb-20">
        {/* Enhanced Search */}
        <div className="px-4 py-4 bg-muted/20">
          <div className="relative mb-4">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
            <Input
              type="text"
              placeholder="Search by title, location, or keywords..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-discover-search"
            />
          </div>

          {/* Sort Options */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {categories.map((category) => (
              <Card 
                key={category.id}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedCategory === category.id 
                    ? 'ring-2 ring-primary bg-primary/10' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedCategory(category.id)}
                data-testid={`discover-category-${category.id}`}
              >
                <CardContent className="p-3 text-center">
                  <i className={`${category.icon} text-lg text-primary mb-2`}></i>
                  <p className="text-xs text-foreground font-medium">{category.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">
              {projects.length} Projects Found
            </h3>
            <Badge variant="outline" data-testid="badge-results-count">
              {selectedCategory !== 'all' ? categories.find(c => c.id === selectedCategory)?.label : 'All'}
            </Badge>
          </div>

          {showMap ? (
            // Map View Placeholder
            <div className="bg-muted rounded-lg h-96 flex items-center justify-center mb-4">
              <div className="text-center">
                <i className="fas fa-map-marked-alt text-4xl text-muted-foreground mb-4"></i>
                <h3 className="font-semibold text-foreground mb-2">Map View</h3>
                <p className="text-sm text-muted-foreground">
                  Interactive map coming soon!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Will show projects on map with location pins
                </p>
              </div>
            </div>
          ) : (
            // List View
            <div className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-card rounded-xl shadow-sm border border-border p-4 animate-pulse">
                      <div className="h-48 bg-muted rounded-lg mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-search text-2xl text-muted-foreground"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-no-results">
                    No projects found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or category filters
                  </p>
                </div>
              ) : (
                projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <BottomNavigation activeTab="discover" />
    </div>
  );
}