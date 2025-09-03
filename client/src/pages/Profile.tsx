import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/BottomNavigation";
import type { UserWithStats, UserBadge } from "@shared/schema";

export default function Profile() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

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

  const { data: profile, isLoading: profileLoading } = useQuery<UserWithStats>({
    queryKey: ['/api/user/profile'],
    enabled: isAuthenticated,
  });

  const { data: recentRsvps = [] } = useQuery<any[]>({
    queryKey: ['/api/user/rsvps'],
    enabled: isAuthenticated,
  });

  if (authLoading || profileLoading) {
    return (
      <div className="max-w-sm mx-auto bg-background min-h-screen">
        <div className="animate-pulse">
          <div className="h-48 bg-gradient-to-r from-primary to-secondary"></div>
          <div className="p-4 space-y-4">
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-40 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-sm mx-auto bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-profile-not-found">
            Profile Not Found
          </h2>
          <Button onClick={() => window.history.back()} data-testid="button-go-back">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const badgeIcons: Record<string, string> = {
    'Beach Warrior': 'fas fa-medal',
    'Tree Hugger': 'fas fa-seedling', 
    'Team Builder': 'fas fa-users',
    'Rising Star': 'fas fa-star',
    'Community Hero': 'fas fa-trophy',
    'Environmental Champion': 'fas fa-leaf',
  };

  const badgeColors: Record<string, string> = {
    'Beach Warrior': 'text-yellow-600 bg-yellow-100',
    'Tree Hugger': 'text-green-600 bg-green-100',
    'Team Builder': 'text-blue-600 bg-blue-100',
    'Rising Star': 'text-purple-600 bg-purple-100',
    'Community Hero': 'text-orange-600 bg-orange-100',
    'Environmental Champion': 'text-emerald-600 bg-emerald-100',
  };

  return (
    <div className="max-w-sm mx-auto bg-background min-h-screen">
      {/* Header */}
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
          <button data-testid="button-settings">
            <i className="fas fa-cog text-xl text-muted-foreground"></i>
          </button>
          <button 
            onClick={() => window.location.href = '/api/logout'}
            data-testid="button-logout"
          >
            <i className="fas fa-sign-out-alt text-xl text-muted-foreground"></i>
          </button>
        </div>
      </header>

      <div className="pb-20">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-8 w-16 h-16 bg-white rounded-full"></div>
            <div className="absolute bottom-4 left-6 w-12 h-12 bg-white rounded-full"></div>
          </div>
          
          <div className="relative z-10 text-center">
            {/* Profile Image */}
            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white/20">
              <AvatarImage src={profile.profileImageUrl || undefined} />
              <AvatarFallback className="bg-white/20 text-white text-2xl">
                {profile.firstName?.[0]}{profile.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <h2 className="text-2xl font-bold mb-1" data-testid="text-user-name">
              {profile.firstName} {profile.lastName}
            </h2>
            {profile.bio && (
              <p className="text-white/80 mb-4" data-testid="text-user-bio">
                {profile.bio}
              </p>
            )}
            
            {/* Stats */}
            <div className="flex justify-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold" data-testid="text-projects-count">
                  {profile._count.organizedProjects}
                </div>
                <div className="text-xs text-white/80">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" data-testid="text-rsvps-count">
                  {profile._count.rsvps}
                </div>
                <div className="text-xs text-white/80">Joined</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" data-testid="text-badges-count">
                  {profile._count.badges}
                </div>
                <div className="text-xs text-white/80">Badges</div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Badges */}
        {profile.badges.length > 0 && (
          <div className="px-4 py-4">
            <h3 className="font-semibold text-lg text-foreground mb-3">Recent Badges</h3>
            <div className="grid grid-cols-4 gap-3">
              {profile.badges.slice(0, 8).map((badge) => (
                <div key={badge.id} className="bg-card border border-border rounded-lg p-3 text-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    badgeColors[badge.badgeName] || 'bg-gray-100 text-gray-600'
                  }`}>
                    <i className={badgeIcons[badge.badgeName] || 'fas fa-award'}></i>
                  </div>
                  <p className="text-xs text-muted-foreground" data-testid={`badge-${badge.badgeName.replace(/\s+/g, '-').toLowerCase()}`}>
                    {badge.badgeName}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {recentRsvps.length > 0 && (
          <div className="px-4 py-4">
            <h3 className="font-semibold text-lg text-foreground mb-3">Recent Activity</h3>
            <div className="space-y-4">
              {recentRsvps.slice(0, 5).map((rsvp: any) => (
                <div key={rsvp.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-check text-white text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground" data-testid={`activity-${rsvp.id}`}>
                      Joined {rsvp.project.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(rsvp.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Impact Summary */}
        <div className="px-4 py-4">
          <h3 className="font-semibold text-lg text-foreground mb-3">Your Impact</h3>
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary" data-testid="text-projects-organized">
                  {profile._count.organizedProjects}
                </div>
                <div className="text-sm text-muted-foreground">Projects Organized</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600" data-testid="text-projects-joined">
                  {profile._count.rsvps}
                </div>
                <div className="text-sm text-muted-foreground">Projects Joined</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600" data-testid="text-hours-volunteered">
                  {profile._count.rsvps * 4}
                </div>
                <div className="text-sm text-muted-foreground">Hours Volunteered</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary" data-testid="text-badges-earned">
                  {profile._count.badges}
                </div>
                <div className="text-sm text-muted-foreground">Badges Earned</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="px-4 py-4">
          <h3 className="font-semibold text-lg text-foreground mb-3">Contact Information</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <i className="fas fa-envelope mr-2 text-muted-foreground"></i>
              <span data-testid="text-email">{profile.email}</span>
            </div>
            {profile.location && (
              <div className="flex items-center">
                <i className="fas fa-map-marker-alt mr-2 text-muted-foreground"></i>
                <span data-testid="text-location">{profile.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNavigation activeTab="profile" />
    </div>
  );
}
