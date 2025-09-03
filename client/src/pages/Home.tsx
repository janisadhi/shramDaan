import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import ProjectCard from "@/components/ProjectCard";
import BottomNavigation from "@/components/BottomNavigation";
import type { ProjectWithDetails } from "@shared/schema";

const categories = [
  { id: 'all', label: 'All Projects' },
  { id: 'cleanup', label: 'Cleanup' },
  { id: 'tree_planting', label: 'Tree Planting' },
  { id: 'education', label: 'Education' },
  { id: 'construction', label: 'Construction' },
  { id: 'food_distribution', label: 'Food Distribution' },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState<string | null>(null);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // For now, just set a default location
          // In production, you would use reverse geocoding
          setLocation("Mumbai, Maharashtra");
        },
        () => {
          setLocation("Location not available");
        }
      );
    }
  }, []);

  const { data: projects = [], isLoading } = useQuery<ProjectWithDetails[]>({
    queryKey: ['/api/projects', { category: selectedCategory, search: searchQuery }],
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
    <div className="max-w-sm mx-auto bg-background min-h-screen relative">
      <Header location={location} />

      {/* Search and Filters */}
      <div className="px-4 py-4 bg-muted/30">
        <div className="relative mb-4">
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
          <Input
            type="text"
            placeholder="Search projects..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search"
          />
        </div>
        
        {/* Filter Tags */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Badge
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className={`cursor-pointer whitespace-nowrap ${
                selectedCategory === category.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card border-border text-foreground hover:bg-muted'
              }`}
              onClick={() => setSelectedCategory(category.id)}
              data-testid={`filter-${category.id}`}
            >
              {category.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Projects Feed */}
      <div className="px-4 pb-20 space-y-4">
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
            <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-no-projects">
              No projects found
            </h3>
            <p className="text-muted-foreground" data-testid="text-try-different">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        )}
      </div>

      <BottomNavigation activeTab="home" />
    </div>
  );
}
