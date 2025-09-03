import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import BottomNavigation from "@/components/BottomNavigation";
import type { ProjectWithDetails } from "@shared/schema";

export default function Messages() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
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

  // Get user's RSVPs to show projects they can chat about
  const { data: userRsvps = [] } = useQuery<any[]>({
    queryKey: ['/api/user/rsvps'],
    enabled: isAuthenticated,
  });

  // Get messages for selected project
  const { data: messages = [] } = useQuery<any[]>({
    queryKey: ['/api/projects', selectedProject, 'messages'],
    enabled: !!selectedProject,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest('POST', `/api/projects/${selectedProject}/messages`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', selectedProject, 'messages'] });
      setNewMessage('');
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
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedProject) return;
    sendMessageMutation.mutate(newMessage.trim());
  };

  if (authLoading) {
    return (
      <div className="max-w-sm mx-auto bg-background min-h-screen">
        <div className="animate-pulse p-4">
          <div className="h-8 bg-muted rounded mb-4"></div>
          <div className="space-y-4">
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto bg-background min-h-screen">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <i className="fas fa-comment text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Messages</h1>
            <p className="text-xs text-muted-foreground">
              {selectedProject ? 'Project Chat' : 'Select a project'}
            </p>
          </div>
        </div>
      </header>

      <div className="pb-20">
        {!selectedProject ? (
          // Project Selection
          <div className="px-4 py-4">
            <h3 className="font-semibold text-lg text-foreground mb-4">Your Projects</h3>
            {userRsvps.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-comment text-2xl text-muted-foreground"></i>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-no-projects">
                  No Projects Joined
                </h3>
                <p className="text-muted-foreground" data-testid="text-join-first">
                  Join a project first to start chatting with other volunteers
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {userRsvps.map((rsvp: any) => (
                  <div 
                    key={rsvp.id}
                    className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setSelectedProject(rsvp.project.id)}
                    data-testid={`chat-project-${rsvp.project.id}`}
                  >
                    <h4 className="font-semibold text-foreground">{rsvp.project.title}</h4>
                    <p className="text-sm text-muted-foreground">{rsvp.project.location}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(rsvp.project.dateTime).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Chat Interface
          <div className="h-full">
            {/* Chat Header */}
            <div className="bg-muted/30 px-4 py-3 border-b border-border flex items-center">
              <button 
                onClick={() => setSelectedProject(null)}
                className="mr-3"
                data-testid="button-back-to-projects"
              >
                <i className="fas fa-arrow-left text-muted-foreground"></i>
              </button>
              <div>
                <h3 className="font-semibold text-foreground">Project Chat</h3>
                <p className="text-xs text-muted-foreground">
                  {userRsvps.find((r: any) => r.project.id === selectedProject)?.project.title}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 px-4 py-4 space-y-4 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-comments text-4xl text-muted-foreground mb-4"></i>
                  <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message: any) => {
                  const isOwnMessage = message.senderId === (user as any)?.id;
                  return (
                    <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs ${isOwnMessage ? 'order-last' : ''}`}>
                        <div className="flex items-start space-x-2">
                          {!isOwnMessage && (
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={message.sender.profileImageUrl || undefined} />
                              <AvatarFallback className="text-xs">
                                {message.sender.firstName?.[0]}{message.sender.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div>
                            <div className={`rounded-lg p-3 ${
                              isOwnMessage 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted text-foreground'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(message.createdAt).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input */}
            <div className="px-4 py-4 border-t border-border">
              <div className="flex space-x-3">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  data-testid="input-message"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  data-testid="button-send-message"
                >
                  <i className="fas fa-paper-plane"></i>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNavigation activeTab="messages" />
    </div>
  );
}