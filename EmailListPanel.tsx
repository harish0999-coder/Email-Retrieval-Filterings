import { Mail, AlertTriangle, CheckCircle, Clock, User, Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { Email, Analytics } from "@shared/schema";

interface EmailListPanelProps {
  emails: Email[];
  selectedEmailId: string | null;
  onEmailSelect: (emailId: string) => void;
  filters: {
    priority: string;
    sentiment: string;
    status: string;
  };
  onFiltersChange: (filters: { priority: string; sentiment: string; status: string }) => void;
  analytics?: Analytics;
  isLoading: boolean;
}

export default function EmailListPanel({
  emails,
  selectedEmailId,
  onEmailSelect,
  filters,
  onFiltersChange,
  analytics,
  isLoading
}: EmailListPanelProps) {
  const getSentimentClass = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "sentiment-positive";
      case "negative": return "sentiment-negative";
      case "neutral": return "sentiment-neutral";
      default: return "sentiment-neutral";
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "urgent": return "priority-urgent";
      case "normal": return "priority-normal";
      case "low": return "priority-low";
      default: return "priority-normal";
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "normal": return "secondary";
      case "low": return "outline";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved": return <CheckCircle className="h-3 w-3 text-primary" />;
      case "responded": return <CheckCircle className="h-3 w-3 text-primary" />;
      case "processing": return <Clock className="h-3 w-3 text-chart-3" />;
      default: return <Bot className="h-3 w-3 text-primary" />;
    }
  };

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const sentDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - sentDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="w-1/3 border-r border-border bg-card overflow-y-auto">
      {/* Stats Cards */}
      <div className="p-4 border-b border-border">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Today</p>
                <p className="text-lg font-semibold text-foreground" data-testid="stat-total">
                  {analytics?.totalEmails || 0}
                </p>
              </div>
              <Mail className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Urgent</p>
                <p className="text-lg font-semibold text-destructive" data-testid="stat-urgent">
                  {analytics?.urgentEmails || 0}
                </p>
              </div>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Resolved</p>
                <p className="text-lg font-semibold text-primary" data-testid="stat-resolved">
                  {analytics?.resolvedEmails || 0}
                </p>
              </div>
              <CheckCircle className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-lg font-semibold text-chart-3" data-testid="stat-pending">
                  {analytics?.pendingEmails || 0}
                </p>
              </div>
              <Clock className="h-4 w-4 text-chart-3" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Filter Controls */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Select
            value={filters.priority}
            onValueChange={(value) => onFiltersChange({ ...filters, priority: value })}
          >
            <SelectTrigger className="flex-1" data-testid="filter-priority">
              <SelectValue placeholder="All Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.sentiment}
            onValueChange={(value) => onFiltersChange({ ...filters, sentiment: value })}
          >
            <SelectTrigger className="flex-1" data-testid="filter-sentiment">
              <SelectValue placeholder="All Sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sentiment</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Email List */}
      <div className="divide-y divide-border">
        {isLoading ? (
          // Loading skeletons
          [...Array(5)].map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="flex space-x-1 ml-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))
        ) : emails.length === 0 ? (
          <div className="p-8 text-center">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No emails found</p>
          </div>
        ) : (
          emails.map((email) => (
            <div
              key={email.id}
              className={`email-item ${getPriorityClass(email.priority || '')} p-4 cursor-pointer transition-colors ${
                selectedEmailId === email.id ? 'bg-accent' : ''
              }`}
              onClick={() => onEmailSelect(email.id)}
              data-testid={`email-item-${email.id}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate" data-testid={`email-sender-${email.id}`}>
                    {email.sender}
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid={`email-time-${email.id}`}>
                    {formatTimeAgo(email.sentDate)}
                  </p>
                </div>
                <div className="flex items-center space-x-1 ml-2">
                  {email.sentiment && (
                    <span className={`${getSentimentClass(email.sentiment)} text-xs px-2 py-1 rounded-full font-medium capitalize`}>
                      {email.sentiment}
                    </span>
                  )}
                  {email.priority && (
                    <Badge variant={getPriorityBadgeVariant(email.priority)} className="text-xs">
                      {email.priority === "urgent" ? "Urgent" : email.priority === "normal" ? "Normal" : "Low"}
                    </Badge>
                  )}
                </div>
              </div>
              <h4 className="text-sm font-medium text-foreground mb-1 line-clamp-1" data-testid={`email-subject-${email.id}`}>
                {email.subject}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2" data-testid={`email-preview-${email.id}`}>
                {email.body.substring(0, 120)}...
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {email.category || "General Support"}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(email.status || '')}
                  <span className="text-xs text-primary capitalize">
                    {email.status === "responded" ? "Response Sent" : 
                     email.status === "resolved" ? "Resolved" :
                     email.status === "processing" ? "Processing" : "AI Ready"}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
