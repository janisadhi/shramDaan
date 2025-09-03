import { useLocation } from "wouter";

interface BottomNavigationProps {
  activeTab: 'home' | 'discover' | 'create' | 'messages' | 'profile';
}

export default function BottomNavigation({ activeTab }: BottomNavigationProps) {
  const [, setLocation] = useLocation();

  const navItems = [
    {
      id: 'home' as const,
      icon: 'fas fa-home',
      label: 'Home',
      path: '/',
    },
    {
      id: 'discover' as const,
      icon: 'fas fa-search',
      label: 'Discover',
      path: '/', // For now, same as home with search
    },
    {
      id: 'create' as const,
      icon: 'fas fa-plus',
      label: 'Create',
      path: '/create',
      isSpecial: true,
    },
    {
      id: 'messages' as const,
      icon: 'fas fa-comment',
      label: 'Messages',
      path: '/', // TODO: Implement messages page
      hasNotification: true,
    },
    {
      id: 'profile' as const,
      icon: 'fas fa-user',
      label: 'Profile',
      path: '/profile',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto bg-card border-t border-border">
      <div className="flex items-center justify-around py-3">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          
          if (item.isSpecial) {
            return (
              <button
                key={item.id}
                onClick={() => setLocation(item.path)}
                className="relative"
                data-testid={`nav-${item.id}`}
              >
                <div className="w-14 h-14 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                  <i className={`${item.icon} text-xl text-white`}></i>
                </div>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setLocation(item.path)}
              className={`nav-item flex flex-col items-center space-y-1 px-3 py-2 ${
                isActive ? 'active' : ''
              }`}
              data-testid={`nav-${item.id}`}
            >
              <div className="relative">
                <i className={`${item.icon} text-lg ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}></i>
                {item.hasNotification && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full text-xs"></span>
                )}
              </div>
              <span className={`text-xs ${
                isActive ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
