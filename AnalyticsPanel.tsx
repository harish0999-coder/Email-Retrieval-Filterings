import { useQuery } from "@tanstack/react-query";
import type { Analytics } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default function AnalyticsPanel() {
  const [timeRange, setTimeRange] = useState("7");
  const volumeChartRef = useRef<HTMLCanvasElement>(null);
  const sentimentChartRef = useRef<HTMLCanvasElement>(null);
  const volumeChartInstance = useRef<Chart | null>(null);
  const sentimentChartInstance = useRef<Chart | null>(null);

  const { data: volumeData, isLoading: volumeLoading } = useQuery({
    queryKey: ["/api/analytics/volume", timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/volume?days=${timeRange}`);
      if (!response.ok) throw new Error("Failed to fetch volume data");
      return response.json() as Promise<{ date: string; count: number }[]>;
    },
  });

  const { data: sentimentData, isLoading: sentimentLoading } = useQuery({
    queryKey: ["/api/analytics/sentiment"],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/sentiment`);
      if (!response.ok) throw new Error("Failed to fetch sentiment data");
      return response.json() as Promise<{ sentiment: string; count: number }[]>;
    },
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics"],
    queryFn: async () => {
      const response = await fetch(`/api/analytics`);
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json() as Promise<Analytics>;
    },
  });

  // Initialize charts
  useEffect(() => {
    if (volumeChartRef.current && volumeData && !volumeLoading) {
      // Destroy existing chart
      if (volumeChartInstance.current) {
        volumeChartInstance.current.destroy();
      }

      const ctx = volumeChartRef.current.getContext('2d');
      if (ctx) {
        volumeChartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: volumeData.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
            datasets: [{
              label: 'Emails Received',
              data: volumeData.map(d => d.count),
              borderColor: 'hsl(210, 100%, 45%)',
              backgroundColor: 'hsla(210, 100%, 45%, 0.1)',
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'hsl(214.3, 31.8%, 91.4%)'
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            }
          }
        });
      }
    }

    return () => {
      if (volumeChartInstance.current) {
        volumeChartInstance.current.destroy();
      }
    };
  }, [volumeData, volumeLoading]);

  useEffect(() => {
    if (sentimentChartRef.current && sentimentData && !sentimentLoading) {
      // Destroy existing chart
      if (sentimentChartInstance.current) {
        sentimentChartInstance.current.destroy();
      }

      const ctx = sentimentChartRef.current.getContext('2d');
      if (ctx) {
        const sentimentCounts = (sentimentData || []).reduce((acc: any, item: any) => {
          acc[item.sentiment] = item.count;
          return acc;
        }, {});

        sentimentChartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Positive', 'Neutral', 'Negative'],
            datasets: [{
              data: [
                sentimentCounts.positive || 0,
                sentimentCounts.neutral || 0,
                sentimentCounts.negative || 0
              ],
              backgroundColor: [
                'hsl(120, 60%, 50%)',
                'hsl(210, 40%, 60%)',
                'hsl(0, 84.2%, 60.2%)'
              ]
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  boxWidth: 12,
                  padding: 8,
                  font: {
                    size: 10
                  }
                }
              }
            }
          }
        });
      }
    }

    return () => {
      if (sentimentChartInstance.current) {
        sentimentChartInstance.current.destroy();
      }
    };
  }, [sentimentData, sentimentLoading]);

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Exporting analytics data...");
  };

  return (
    <div className="h-80 border-t border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground" data-testid="analytics-title">Analytics & Insights</h3>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40" data-testid="analytics-time-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24 hours</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            data-testid="export-analytics-button"
          >
            <Download className="mr-1 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-6 h-52">
        {/* Email Volume Chart */}
        <div className="col-span-2 bg-muted rounded-lg p-4">
          <h4 className="text-sm font-medium text-foreground mb-2">Email Volume Trend</h4>
          {volumeLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <Skeleton className="w-full h-32" />
            </div>
          ) : (
            <canvas ref={volumeChartRef} className="w-full h-full" data-testid="volume-chart" />
          )}
        </div>
        
        {/* Sentiment Distribution */}
        <div className="bg-muted rounded-lg p-4">
          <h4 className="text-sm font-medium text-foreground mb-2">Sentiment Distribution</h4>
          {sentimentLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <Skeleton className="w-32 h-32 rounded-full" />
            </div>
          ) : (
            <canvas ref={sentimentChartRef} className="w-full h-full" data-testid="sentiment-chart" />
          )}
        </div>
        
        {/* Response Time Metrics */}
        <div className="bg-muted rounded-lg p-4">
          <h4 className="text-sm font-medium text-foreground mb-2">Response Metrics</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Avg Response Time</span>
                <span data-testid="avg-response-time">{analytics?.avgResponseTime ? `${Math.floor(analytics.avgResponseTime / 60)}h` : "2.3h"}</span>
              </div>
              <div className="w-full bg-border rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full" style={{width: "78%"}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Resolution Rate</span>
                <span data-testid="resolution-rate">{analytics?.resolutionRate || 89}%</span>
              </div>
              <div className="w-full bg-border rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full" style={{width: `${analytics?.resolutionRate || 89}%`}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Customer Satisfaction</span>
                <span data-testid="customer-satisfaction">{analytics?.customerSatisfaction || 4.7}/5</span>
              </div>
              <div className="w-full bg-border rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full" style={{width: `${((analytics?.customerSatisfaction || 4.7) / 5) * 100}%`}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
