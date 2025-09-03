import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import type { Notification } from "@shared/schema";

interface HeaderProps {
  location?: string | null;
}

export default function Header({ location }: HeaderProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    enabled: !!user,
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="bg-card border-b border-border px-4 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
          <i className="fas fa-hands-helping text-white text-lg"></i>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Shram Daan</h1>
          <p className="text-xs text-muted-foreground" data-testid="text-location">
            {location || "Loading location..."}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <button 
          onClick={() => setLocation('/leaderboard')}
          data-testid="button-leaderboard"
        >
          <i className="fas fa-trophy text-xl text-muted-foreground"></i>
        </button>
        <button className="relative" data-testid="button-notifications">
          <i className="fas fa-bell text-xl text-muted-foreground"></i>
          {unreadCount > 0 && (
            <span 
              className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-destructive to-destructive/80 rounded-full text-xs text-white flex items-center justify-center"
              data-testid="badge-notification-count"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <button 
          onClick={() => setLocation('/profile')}
          data-testid="button-profile"
        >
          <Avatar className="w-10 h-10 border-2 border-primary/20">
            <AvatarImage src={(user as any)?.profileImageUrl || undefined} />
            <AvatarFallback>
              {(user as any)?.firstName?.[0]}{(user as any)?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
        </button>
      </div>
    </header>
  );
}
