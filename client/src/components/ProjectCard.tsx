import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useLocation } from "wouter";
import type { ProjectWithDetails } from "@shared/schema";

interface ProjectCardProps {
  project: ProjectWithDetails;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [, setLocation] = useLocation();

  const formatDate = (dateTime: string | Date) => {
    return new Date(dateTime).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateTime: string | Date) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cleanup':
        return 'bg-primary/10 text-primary';
      case 'tree_planting':
        return 'bg-green-100 text-green-800';
      case 'education':
        return 'bg-blue-100 text-blue-800';
      case 'construction':
        return 'bg-orange-100 text-orange-800';
      case 'food_distribution':
        return 'bg-purple-100 text-purple-800';
      case 'healthcare':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className="project-card bg-card rounded-xl shadow-sm border border-border overflow-hidden cursor-pointer hover:shadow-md transition-all duration-300"
      onClick={() => setLocation(`/project/${project.id}`)}
      data-testid={`project-card-${project.id}`}
    >
      {/* Project Image */}
      {project.imageUrl && (
        <img 
          src={project.imageUrl} 
          alt={project.title}
          className="w-full h-48 object-cover"
        />
      )}
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground mb-1 line-clamp-2" data-testid="text-project-title">
              {project.title}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center mb-2">
              <i className="fas fa-map-marker-alt mr-1"></i>
              <span data-testid="text-project-location">{project.location}</span>
            </p>
          </div>
          <Badge 
            className={`ml-2 text-xs font-medium ${getCategoryColor(project.category)}`}
            data-testid="badge-category"
          >
            {project.category.replace('_', ' ')}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2" data-testid="text-project-description">
          {project.description}
        </p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-muted-foreground">
              <i className="fas fa-calendar-alt mr-1"></i>
              <span data-testid="text-project-date">{formatDate(project.dateTime)}</span>
            </span>
            <span className="flex items-center text-muted-foreground">
              <i className="fas fa-clock mr-1"></i>
              <span data-testid="text-project-time">{formatTime(project.dateTime)}</span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              {project.rsvps.slice(0, 3).map((rsvp) => (
                <Avatar key={rsvp.id} className="w-6 h-6 border-2 border-card">
                  <AvatarImage src={rsvp.user.profileImageUrl || undefined} />
                  <AvatarFallback className="text-xs">
                    {rsvp.user.firstName?.[0]}{rsvp.user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
              {project._count.rsvps > 3 && (
                <div className="w-6 h-6 bg-muted rounded-full border-2 border-card flex items-center justify-center">
                  <span className="text-xs font-medium text-muted-foreground">
                    +{project._count.rsvps - 3}
                  </span>
                </div>
              )}
            </div>
            <span className="text-xs text-muted-foreground" data-testid="text-volunteer-count">
              {project._count.rsvps > 0 && `+${project._count.rsvps}`}
            </span>
          </div>
        </div>

        {/* Organizer Info */}
        <div className="flex items-center mt-3 pt-3 border-t border-border">
          <Avatar className="w-6 h-6 mr-2">
            <AvatarImage src={project.organizer.profileImageUrl || undefined} />
            <AvatarFallback className="text-xs">
              {project.organizer.firstName?.[0]}{project.organizer.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground" data-testid="text-organizer">
            By {project.organizer.firstName} {project.organizer.lastName}
          </span>
        </div>
      </div>
    </div>
  );
}
