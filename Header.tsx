import { useState } from "react";
import { Menu, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  totalEmails: number;
  onMobileMenuToggle: () => void;
  onSyncEmails: () => void;
}

export default function Header({ totalEmails, onMobileMenuToggle, onSyncEmails }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSyncEmails();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden p-2"
            onClick={onMobileMenuToggle}
            data-testid="mobile-menu-button"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground" data-testid="page-title">Email Dashboard</h1>
            <p className="text-sm text-muted-foreground" data-testid="email-count">
              Managing {totalEmails} support emails today
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pr-10"
              data-testid="search-input"
            />
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
            data-testid="sync-button"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Emails
          </Button>
        </div>
      </div>
    </header>
  );
}
