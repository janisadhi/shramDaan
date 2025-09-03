import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ProjectWithDetails } from "@shared/schema";

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: project, isLoading } = useQuery<ProjectWithDetails>({
    queryKey: ['/api/projects', id],
    enabled: !!id,
  });

  const rsvpMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', `/api/projects/${id}/rsvp`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', id] });
      toast({
        title: "Success!",
        description: "You've successfully joined this project.",
      });
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
        description: error.message || "Failed to join project",
        variant: "destructive",
      });
    },
  });

  const cancelRsvpMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/projects/${id}/rsvp`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', id] });
      toast({
        title: "RSVP Cancelled",
        description: "You've cancelled your participation in this project.",
      });
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
        description: error.message || "Failed to cancel RSVP",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-sm mx-auto bg-background min-h-screen">
        <div className="animate-pulse">
          <div className="h-64 bg-muted"></div>
          <div className="p-4 space-y-4">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-sm mx-auto bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-project-not-found">
            Project Not Found
          </h2>
          <Button onClick={() => window.history.back()} data-testid="button-go-back">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isUserRegistered = project.rsvps.some(rsvp => rsvp.userId === user?.id);
  const progressPercentage = project.maxVolunteers 
    ? (project._count.rsvps / project.maxVolunteers) * 100 
    : 0;

  const formatDate = (dateTime: string) => {
    return new Date(dateTime).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="max-w-sm mx-auto bg-background min-h-screen">
      {/* Header with back button */}
      <header className="bg-card border-b border-border px-4 py-4 flex items-center justify-between">
        <button 
          onClick={() => window.history.back()} 
          className="flex items-center space-x-2 text-muted-foreground"
          data-testid="button-back"
        >
          <i className="fas fa-arrow-left"></i>
          <span>Back</span>
        </button>
        <div className="flex items-center space-x-3">
          <button data-testid="button-share">
            <i className="fas fa-share-alt text-xl text-muted-foreground"></i>
          </button>
          <button data-testid="button-favorite">
            <i className="fas fa-heart text-xl text-muted-foreground"></i>
          </button>
        </div>
      </header>

      <div className="pb-20">
        {/* Project Image */}
        {project.imageUrl && (
          <img 
            src={project.imageUrl} 
            alt={project.title}
            className="w-full h-64 object-cover" 
            data-testid="img-project"
          />
        )}

        <div className="px-4 py-4">
          {/* Project Header */}
          <div className="mb-4">
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-2xl font-bold text-foreground flex-1" data-testid="text-project-title">
                {project.title}
              </h1>
              <Badge className="ml-2" data-testid="badge-category">
                {project.category.replace('_', ' ')}
              </Badge>
            </div>
            
            <div className="flex items-center text-muted-foreground mb-2">
              <i className="fas fa-map-marker-alt mr-2"></i>
              <span data-testid="text-location">{project.location}</span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center">
                <i className="fas fa-calendar-alt mr-1"></i>
                <span data-testid="text-date">{formatDate(project.dateTime)}</span>
              </span>
              <span className="flex items-center">
                <i className="fas fa-clock mr-1"></i>
                <span data-testid="text-time">{formatTime(project.dateTime)}</span>
              </span>
            </div>
          </div>

          {/* Organizer Info */}
          <div className="bg-muted/30 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={project.organizer.profileImageUrl} />
                <AvatarFallback>
                  {project.organizer.firstName?.[0]}{project.organizer.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground" data-testid="text-organizer-name">
                  {project.organizer.firstName} {project.organizer.lastName}
                </h3>
                <p className="text-sm text-muted-foreground" data-testid="text-organizer-email">
                  {project.organizer.email}
                </p>
              </div>
              <Button variant="outline" size="sm" data-testid="button-follow">
                Follow
              </Button>
            </div>
          </div>

          {/* Project Description */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg text-foreground mb-3">About This Project</h3>
            <p className="text-muted-foreground leading-relaxed" data-testid="text-description">
              {project.description}
            </p>
          </div>

          {/* What to Bring */}
          {project.requirements && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg text-foreground mb-3">What to Bring</h3>
              <p className="text-muted-foreground" data-testid="text-requirements">
                {project.requirements}
              </p>
            </div>
          )}

          {/* What's Provided */}
          {project.provided && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg text-foreground mb-3">What's Provided</h3>
              <p className="text-muted-foreground" data-testid="text-provided">
                {project.provided}
              </p>
            </div>
          )}

          {/* Volunteers Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg text-foreground">Volunteers</h3>
              <span className="text-sm text-muted-foreground" data-testid="text-volunteer-count">
                {project._count.rsvps}
                {project.maxVolunteers && ` / ${project.maxVolunteers}`} joined
              </span>
            </div>
            
            {/* Progress Bar */}
            {project.maxVolunteers && (
              <Progress value={progressPercentage} className="mb-4" />
            )}
            
            {/* Volunteer Avatars */}
            <div className="flex flex-wrap gap-2">
              {project.rsvps.slice(0, 10).map((rsvp) => (
                <Avatar key={rsvp.id} className="w-10 h-10">
                  <AvatarImage src={rsvp.user.profileImageUrl} />
                  <AvatarFallback>
                    {rsvp.user.firstName?.[0]}{rsvp.user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
              {project._count.rsvps > 10 && (
                <div className="w-10 h-10 bg-muted rounded-full border-2 border-card flex items-center justify-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    +{project._count.rsvps - 10}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          {(project.contactPerson || project.contactPhone) && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg text-foreground mb-3">Contact Information</h3>
              <div className="space-y-2">
                {project.contactPerson && (
                  <div className="flex items-center">
                    <i className="fas fa-user mr-2 text-muted-foreground"></i>
                    <span data-testid="text-contact-person">{project.contactPerson}</span>
                  </div>
                )}
                {project.contactPhone && (
                  <div className="flex items-center">
                    <i className="fas fa-phone mr-2 text-muted-foreground"></i>
                    <span data-testid="text-contact-phone">{project.contactPhone}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Floating RSVP Button */}
        <div className="fixed bottom-20 left-4 right-4 max-w-sm mx-auto">
          {isUserRegistered ? (
            <Button
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => cancelRsvpMutation.mutate()}
              disabled={cancelRsvpMutation.isPending}
              data-testid="button-cancel-rsvp"
            >
              <div className="flex items-center justify-center space-x-2">
                <i className="fas fa-times"></i>
                <span>
                  {cancelRsvpMutation.isPending ? 'Cancelling...' : 'Cancel RSVP'}
                </span>
              </div>
            </Button>
          ) : (
            <Button
              className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70"
              onClick={() => rsvpMutation.mutate()}
              disabled={rsvpMutation.isPending || (project.maxVolunteers && project._count.rsvps >= project.maxVolunteers)}
              data-testid="button-join-project"
            >
              <div className="flex items-center justify-center space-x-2">
                <i className="fas fa-check"></i>
                <span>
                  {rsvpMutation.isPending 
                    ? 'Joining...' 
                    : (project.maxVolunteers && project._count.rsvps >= project.maxVolunteers)
                    ? 'Project Full'
                    : 'Join This Project'
                  }
                </span>
              </div>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
