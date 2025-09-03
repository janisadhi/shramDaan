import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNavigation from "@/components/BottomNavigation";

// Mock leaderboard data structure
const mockLeaderboardData = {
  topVolunteers: [
    {
      id: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      profileImageUrl: null,
      totalProjects: 15,
      totalHours: 60,
      badges: 8,
      rank: 1,
    },
    {
      id: 'user-2',
      firstName: 'Sara',
      lastName: 'Patel',
      profileImageUrl: null,
      totalProjects: 12,
      totalHours: 48,
      badges: 6,
      rank: 2,
    },
    {
      id: 'user-3',
      firstName: 'Amit',
      lastName: 'Sharma',
      profileImageUrl: null,
      totalProjects: 10,
      totalHours: 40,
      badges: 5,
      rank: 3,
    },
  ],
  topOrganizers: [
    {
      id: 'user-2',
      firstName: 'Sara',
      lastName: 'Patel',
      profileImageUrl: null,
      projectsOrganized: 8,
      totalVolunteers: 150,
      successRate: 95,
      rank: 1,
    },
    {
      id: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      profileImageUrl: null,
      projectsOrganized: 6,
      totalVolunteers: 120,
      successRate: 90,
      rank: 2,
    },
  ],
  recentBadges: [
    {
      id: 'badge-1',
      userId: 'user-1',
      userName: 'John Doe',
      badgeName: 'Environmental Champion',
      badgeIcon: 'fas fa-leaf',
      earnedAt: new Date().toISOString(),
    },
    {
      id: 'badge-2',
      userId: 'user-2',
      userName: 'Sara Patel',
      badgeName: 'Team Builder',
      badgeIcon: 'fas fa-users',
      earnedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'badge-3',
      userId: 'user-3',
      userName: 'Amit Sharma',
      badgeName: 'Beach Warrior',
      badgeIcon: 'fas fa-medal',
      earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]
};

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('volunteers');

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return 'fas fa-crown text-yellow-500';
      case 2: return 'fas fa-medal text-gray-400';
      case 3: return 'fas fa-award text-amber-600';
      default: return 'fas fa-hashtag text-muted-foreground';
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300';
      case 2: return 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300';
      case 3: return 'bg-gradient-to-r from-amber-100 to-amber-200 border-amber-300';
      default: return 'bg-card border-border';
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-background min-h-screen">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
            <i className="fas fa-trophy text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Leaderboard</h1>
            <p className="text-xs text-muted-foreground">Community champions</p>
          </div>
        </div>
      </header>

      <div className="pb-20">
        {/* Stats Overview */}
        <div className="px-4 py-4 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">47</div>
              <div className="text-xs text-muted-foreground">Active Projects</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary">285</div>
              <div className="text-xs text-muted-foreground">Total Volunteers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">1,240</div>
              <div className="text-xs text-muted-foreground">Hours Contributed</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="volunteers" data-testid="tab-volunteers">Top Volunteers</TabsTrigger>
              <TabsTrigger value="organizers" data-testid="tab-organizers">Organizers</TabsTrigger>
              <TabsTrigger value="badges" data-testid="tab-badges">Recent Badges</TabsTrigger>
            </TabsList>

            {/* Top Volunteers Tab */}
            <TabsContent value="volunteers" className="mt-4 space-y-3">
              {mockLeaderboardData.topVolunteers.map((volunteer, index) => (
                <Card 
                  key={volunteer.id} 
                  className={`${getRankColor(volunteer.rank)}`}
                  data-testid={`volunteer-rank-${volunteer.rank}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <i className={`${getRankIcon(volunteer.rank)} text-lg`}></i>
                        <span className="font-bold text-lg">#{volunteer.rank}</span>
                      </div>
                      
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={volunteer.profileImageUrl || undefined} />
                        <AvatarFallback>
                          {volunteer.firstName[0]}{volunteer.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">
                          {volunteer.firstName} {volunteer.lastName}
                        </h4>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span><i className="fas fa-tasks mr-1"></i>{volunteer.totalProjects} projects</span>
                          <span><i className="fas fa-clock mr-1"></i>{volunteer.totalHours}h</span>
                          <span><i className="fas fa-trophy mr-1"></i>{volunteer.badges} badges</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Top Organizers Tab */}
            <TabsContent value="organizers" className="mt-4 space-y-3">
              {mockLeaderboardData.topOrganizers.map((organizer, index) => (
                <Card 
                  key={organizer.id} 
                  className={`${getRankColor(organizer.rank)}`}
                  data-testid={`organizer-rank-${organizer.rank}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <i className={`${getRankIcon(organizer.rank)} text-lg`}></i>
                        <span className="font-bold text-lg">#{organizer.rank}</span>
                      </div>
                      
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={organizer.profileImageUrl || undefined} />
                        <AvatarFallback>
                          {organizer.firstName[0]}{organizer.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">
                          {organizer.firstName} {organizer.lastName}
                        </h4>
                        <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                          <span><i className="fas fa-project-diagram mr-1"></i>{organizer.projectsOrganized} organized</span>
                          <span><i className="fas fa-users mr-1"></i>{organizer.totalVolunteers} volunteers</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-green-600 font-medium">
                            <i className="fas fa-check-circle mr-1"></i>{organizer.successRate}% success rate
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Recent Badges Tab */}
            <TabsContent value="badges" className="mt-4 space-y-3">
              {mockLeaderboardData.recentBadges.map((badge) => (
                <Card key={badge.id} className="bg-card border-border" data-testid={`badge-${badge.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                        <i className={`${badge.badgeIcon} text-white text-lg`}></i>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{badge.badgeName}</h4>
                        <p className="text-sm text-muted-foreground">Earned by {badge.userName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(badge.earnedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: new Date(badge.earnedAt).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                          })}
                        </p>
                      </div>
                      
                      <Badge className="bg-primary/10 text-primary">
                        <i className="fas fa-star mr-1"></i>
                        New
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <BottomNavigation activeTab="discover" />
    </div>
  );
}