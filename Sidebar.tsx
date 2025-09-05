import { Link, useLocation } from "wouter";
import { Bot, Gauge, Mail, AlertTriangle, CheckCircle, BarChart3, Settings, User } from "lucide-react";

interface SidebarProps {
  isMobileMenuOpen: boolean;
  onMobileMenuClose: () => void;
  onFilterChange?: (filter: { priority?: string; sentiment?: string; status?: string }) => void;
  currentFilters?: { priority: string; sentiment: string; status: string };
}

export default function Sidebar({ isMobileMenuOpen, onMobileMenuClose, onFilterChange, currentFilters }: SidebarProps) {
  const [location] = useLocation();

  const handleNavClick = (type: string) => {
    if (!onFilterChange) return;
    
    switch (type) {
      case 'all':
        onFilterChange({ priority: 'all', sentiment: 'all', status: 'all' });
        break;
      case 'urgent':
        onFilterChange({ priority: 'urgent', sentiment: 'all', status: 'all' });
        break;
      case 'resolved':
        onFilterChange({ priority: 'all', sentiment: 'all', status: 'resolved' });
        break;
      default:
        break;
    }
  };

  const navigation = [
    { name: "Dashboard", href: "/", icon: Gauge, current: location === "/", onClick: null },
    { name: "All Emails", href: "#", icon: Mail, current: !currentFilters?.priority || currentFilters.priority === 'all', onClick: () => handleNavClick('all') },
    { name: "Urgent", href: "#", icon: AlertTriangle, current: currentFilters?.priority === 'urgent', onClick: () => handleNavClick('urgent') },
    { name: "Resolved", href: "#", icon: CheckCircle, current: currentFilters?.status === 'resolved', onClick: () => handleNavClick('resolved') },
    { name: "Analytics", href: "#", icon: BarChart3, current: false, onClick: null },
    { name: "Settings", href: "#", icon: Settings, current: false, onClick: null },
  ];

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 bg-card border-r border-border">
      <div className="flex items-center justify-center h-16 border-b border-border">
        <div className="flex items-center space-x-2">
          <Bot className="h-8 w-8 text-primary" data-testid="logo-icon" />
          <span className="text-xl font-semibold text-foreground" data-testid="logo-text">AI Assistant</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          
          if (item.onClick) {
            return (
              <button
                key={item.name}
                onClick={item.onClick}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  item.current
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
                data-testid={`nav-${item.name.toLowerCase().replace(" ", "-")}`}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.name}
              </button>
            );
          }
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                item.current
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
              data-testid={`nav-${item.name.toLowerCase().replace(" ", "-")}`}
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate" data-testid="user-name">Support Admin</p>
            <p className="text-xs text-muted-foreground truncate" data-testid="user-role">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}
