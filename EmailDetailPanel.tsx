import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, Edit, Send, RefreshCw, Tag, User, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Email, Response } from "@shared/schema";

interface EmailDetailPanelProps {
  email?: Email;
  onEmailUpdate: () => void;
}

export default function EmailDetailPanel({ email, onEmailUpdate }: EmailDetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedResponse, setEditedResponse] = useState("");
  const { toast } = useToast();

  const { data: responses = [], isLoading: responsesLoading } = useQuery({
    queryKey: ["/api/emails", email?.id, "responses"],
    queryFn: async () => {
      if (!email?.id) throw new Error("Email ID required");
      const response = await fetch(`/api/emails/${email.id}/responses`);
      if (!response.ok) throw new Error("Failed to fetch responses");
      return response.json() as Promise<Response[]>;
    },
    enabled: !!email?.id,
  });

  const latestResponse = responses[0];

  const generateResponseMutation = useMutation({
    mutationFn: async (emailId: string) => {
      const response = await fetch(`/api/emails/${emailId}/generate-response`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to generate response");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emails", email?.id, "responses"] });
      onEmailUpdate();
      toast({
        title: "Response Generated",
        description: "AI response has been generated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate AI response. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateResponseMutation = useMutation({
    mutationFn: async ({ responseId, content }: { responseId: string; content: string }) => {
      const response = await fetch(`/api/responses/${responseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error("Failed to update response");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emails", email?.id, "responses"] });
      setIsEditing(false);
      toast({
        title: "Response Updated",
        description: "Response has been updated successfully.",
      });
    },
  });

  const sendResponseMutation = useMutation({
    mutationFn: async (responseId: string) => {
      const response = await fetch(`/api/responses/${responseId}/send`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to send response");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emails", email?.id, "responses"] });
      onEmailUpdate();
      toast({
        title: "Response Sent",
        description: "Email response has been sent successfully.",
      });
    },
  });

  const handleEditResponse = () => {
    if (latestResponse) {
      setEditedResponse(latestResponse.content);
      setIsEditing(true);
    }
  };

  const handleSaveResponse = () => {
    if (latestResponse && editedResponse.trim()) {
      updateResponseMutation.mutate({
        responseId: latestResponse.id,
        content: editedResponse.trim(),
      });
    }
  };

  const handleSendResponse = () => {
    if (latestResponse) {
      sendResponseMutation.mutate(latestResponse.id);
    }
  };

  const handleGenerateResponse = () => {
    if (email) {
      generateResponseMutation.mutate(email.id);
    }
  };

  const getSentimentClass = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "sentiment-positive";
      case "negative": return "sentiment-negative";
      case "neutral": return "sentiment-neutral";
      default: return "sentiment-neutral";
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

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(date));
  };

  if (!email) {
    return (
      <div className="flex-1 bg-card overflow-y-auto">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Select an email to view details</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-card overflow-y-auto">
      <div className="p-6">
        {/* Email Header */}
        <div className="border-b border-border pb-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-xl font-semibold text-foreground" data-testid="email-detail-subject">
                  {email.subject}
                </h2>
                {email.priority && (
                  <Badge variant={getPriorityBadgeVariant(email.priority)} data-testid="email-detail-priority">
                    {email.priority === "urgent" ? "Urgent" : email.priority === "normal" ? "Normal" : "Low"}
                  </Badge>
                )}
                {email.sentiment && (
                  <span className={`${getSentimentClass(email.sentiment)} text-xs px-2 py-1 rounded-full font-medium capitalize`} data-testid="email-detail-sentiment">
                    {email.sentiment}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span data-testid="email-detail-sender">{email.sender}</span>
                <span data-testid="email-detail-date">{formatDate(email.sentDate)}</span>
                <span data-testid="email-detail-id">ID: #{email.id.slice(-8)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" data-testid="categorize-button">
                <Tag className="mr-1 h-4 w-4" />
                Categorize
              </Button>
              <Button 
                onClick={handleGenerateResponse}
                disabled={generateResponseMutation.isPending}
                size="sm"
                data-testid="generate-response-button"
              >
                <Bot className="mr-1 h-4 w-4" />
                {generateResponseMutation.isPending ? "Generating..." : "Generate Response"}
              </Button>
            </div>
          </div>
          
          {/* Extracted Information */}
          {email.extractedInfo && (
            <div className="bg-muted rounded-lg p-4">
              <h3 className="text-sm font-medium text-foreground mb-3">Extracted Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Contact Details</p>
                  <p className="text-sm text-foreground">{email.sender}</p>
                  {email.extractedInfo.contactDetails?.map((contact, index) => (
                    <p key={index} className="text-sm text-foreground">{contact}</p>
                  ))}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Issue Type</p>
                  <p className="text-sm text-foreground">
                    {email.extractedInfo.issueType?.join(", ") || email.category || "General Support"}
                  </p>
                </div>
                {email.extractedInfo.sentimentKeywords && email.extractedInfo.sentimentKeywords.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Sentiment Indicators</p>
                    <div className="flex flex-wrap gap-1">
                      {email.extractedInfo.sentimentKeywords.map((keyword, index) => (
                        <span key={index} className="text-xs bg-destructive/20 text-destructive px-2 py-1 rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {email.extractedInfo.priorityKeywords && email.extractedInfo.priorityKeywords.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Priority Keywords</p>
                    <div className="flex flex-wrap gap-1">
                      {email.extractedInfo.priorityKeywords.map((keyword, index) => (
                        <span key={index} className="text-xs bg-destructive/20 text-destructive px-2 py-1 rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Email Content */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-foreground mb-3">Email Content</h3>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap" data-testid="email-detail-body">
              {email.body}
            </p>
          </div>
        </div>
        
        {/* AI Generated Response */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground">AI Generated Response</h3>
            {latestResponse && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">
                  Quality: {latestResponse.qualityScore || 92}%
                </span>
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleGenerateResponse}
                  disabled={generateResponseMutation.isPending}
                  className="text-xs p-0 h-auto"
                  data-testid="regenerate-response-button"
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Regenerate
                </Button>
              </div>
            )}
          </div>
          
          {responsesLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : latestResponse ? (
            <div>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                {isEditing ? (
                  <Textarea
                    value={editedResponse}
                    onChange={(e) => setEditedResponse(e.target.value)}
                    className="w-full h-48 text-sm resize-none border-0 bg-transparent focus:outline-none focus:ring-0"
                    data-testid="response-editor"
                  />
                ) : (
                  <div className="text-sm text-foreground whitespace-pre-wrap" data-testid="ai-response-content">
                    {latestResponse.content}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-muted-foreground">
                    Tone: {latestResponse.tone || "Professional & Empathetic"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Context: {latestResponse.context || "Account Access Issue"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                        data-testid="cancel-edit-button"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveResponse}
                        disabled={updateResponseMutation.isPending}
                        size="sm"
                        data-testid="save-response-button"
                      >
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditResponse}
                        data-testid="edit-response-button"
                      >
                        <Edit className="mr-1 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        onClick={handleSendResponse}
                        disabled={sendResponseMutation.isPending || !!latestResponse.isSent}
                        size="sm"
                        data-testid="send-response-button"
                      >
                        <Send className="mr-1 h-4 w-4" />
                        {latestResponse.isSent ? "Sent" : sendResponseMutation.isPending ? "Sending..." : "Send Response"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-muted rounded-lg p-8 text-center">
              <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No AI response generated yet</p>
              <Button
                onClick={handleGenerateResponse}
                disabled={generateResponseMutation.isPending}
                data-testid="generate-first-response-button"
              >
                <Bot className="mr-2 h-4 w-4" />
                Generate AI Response
              </Button>
            </div>
          )}
        </div>
        
        {/* Knowledge Base */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Similar Cases (Knowledge Base)</h3>
          <div className="space-y-2">
            <div className="bg-muted rounded-lg p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground">Password reset link not working - Solution Guide</p>
                <span className="text-xs text-primary">KB-001</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Common causes and solutions for password reset failures</p>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground">Account access troubleshooting steps</p>
                <span className="text-xs text-primary">KB-007</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Step-by-step guide for account access issues</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
