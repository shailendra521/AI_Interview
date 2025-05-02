"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, LineChart, BarChart, PieChart, Activity, Users, Calendar, ThumbsUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Response } from "@/types/response";

interface DashboardClientProps {
  initialStats?: {
    totalInterviews: number;
    totalResponses: number;
    averageDuration: number;
    averageSatisfaction: number;
    responsesByDate: Record<string, number>;
    interviewsByStatus: { active: number; archived: number };
    candidateStatusCounts: Record<string, number>;
  };
  initialRecentResponses?: Response[];
  initialTopInterviews?: any[];
  initialFeedbackStats?: {
    satisfactionCounts: Record<number, number>;
    totalFeedbackCount: number;
    feedbackData: any[];
  };
  error?: string;
}

export default function AnalyticsDashboardClient({
  initialStats,
  initialRecentResponses = [],
  initialTopInterviews = [],
  initialFeedbackStats,
  error
}: DashboardClientProps) {
  // Client-side state to ensure hydration consistency
  const [isClient, setIsClient] = useState(false);
  
  // If we have an error, we'll show an error message
  const [errorMessage] = useState(error);
  
  // Use the pre-fetched data directly
  const stats = initialStats || {
    totalInterviews: 0,
    totalResponses: 0,
    averageDuration: 0,
    averageSatisfaction: 0,
    responsesByDate: {},
    interviewsByStatus: { active: 0, archived: 0 },
    candidateStatusCounts: {},
  };
  
  const recentResponses = initialRecentResponses;
  const topInterviews = initialTopInterviews;
  const feedbackStats = initialFeedbackStats || {
    satisfactionCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    totalFeedbackCount: 0,
    feedbackData: [],
  };

  // Set isClient to true after component mounts to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  // Helper function to safely format dates in a consistent way
  const formatDate = (dateString: string) => {
    if (!isClient) return ''; // Return empty string on server to avoid hydration mismatch
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  if (errorMessage) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Analytics Dashboard</h1>
            <p className="text-slate-500 mt-1">Insights and performance metrics for your interviews</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Analytics Dashboard</h1>
          <p className="text-slate-500 mt-1">Insights and performance metrics for your interviews</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-50">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="ml-3">
                <div className="text-2xl font-bold">{stats.totalInterviews}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-50">
                <LineChart className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <div className="text-2xl font-bold">{stats.totalResponses}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-amber-50">
                <Activity className="h-5 w-5 text-amber-600" />
              </div>
              <div className="ml-3">
                <div className="text-2xl font-bold">{formatDuration(stats.averageDuration)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-purple-50">
                <ThumbsUp className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <div className="text-2xl font-bold">{stats.averageSatisfaction || "N/A"}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* Interview Status */}
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-lg text-slate-800">Interview Status</CardTitle>
            <CardDescription>Active vs Archived interviews</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 flex items-center justify-center">
              <div className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                    {stats.interviewsByStatus.active}
                  </div>
                  <div className="mt-3 text-sm font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Active</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-xl font-bold shadow-md">
                    {stats.interviewsByStatus.archived}
                  </div>
                  <div className="mt-3 text-sm font-medium bg-gray-100 text-gray-800 px-3 py-1 rounded-full">Archived</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Satisfaction Rating Distribution */}
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-lg text-slate-800">Satisfaction Ratings</CardTitle>
            <CardDescription>Feedback rating distribution</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 flex flex-col justify-center">
              {feedbackStats.totalFeedbackCount > 0 ? (
                <div className="grid grid-cols-1 gap-2 w-full">
                  {Object.entries(feedbackStats.satisfactionCounts).map(([rating, count]) => (
                    <div key={rating} className="flex items-center">
                      <div className="w-20 text-sm font-medium flex items-center">
                        {parseInt(rating) === 1 ? '⭐' : '⭐'.repeat(parseInt(rating))}
                      </div>
                      <div className="w-[60%] mx-2">
                        <div className="h-6 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 shadow-sm" 
                            style={{ 
                              width: `${(count / feedbackStats.totalFeedbackCount) * 100}%`,
                              transition: 'width 1s ease-in-out' 
                            }} 
                          />
                        </div>
                      </div>
                      <div className="text-sm font-medium w-10 text-right">{count}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500">No feedback data available</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Candidate Status Distribution */}
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-lg text-slate-800">Candidate Status</CardTitle>
            <CardDescription>Status breakdown of responses</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 flex items-center justify-center overflow-y-auto">
              {Object.keys(stats.candidateStatusCounts).length > 0 ? (
                <div className="grid grid-cols-1 gap-2 w-full">
                  {Object.entries(stats.candidateStatusCounts)
                    .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
                    .map(([status, count], index) => {
                      // Generate a different color for each status
                      const colors = [
                        'from-green-400 to-green-500',
                        'from-blue-400 to-blue-500',
                        'from-purple-400 to-purple-500',
                        'from-pink-400 to-pink-500',
                        'from-indigo-400 to-indigo-500',
                      ];
                      const colorIndex = index % colors.length;
                      
                      return (
                        <div key={status} className="flex items-center">
                          <div className="w-36 truncate text-sm font-medium">
                            {status.replace(/_/g, ' ')}
                          </div>
                          <div className="w-[55%] mx-2">
                            <div className="h-6 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                              <div 
                                className={`h-full bg-gradient-to-r ${colors[colorIndex]} shadow-sm`}
                                style={{ 
                                  width: `${(count / stats.totalResponses) * 100}%`,
                                  transition: 'width 1s ease-in-out'
                                }} 
                              />
                            </div>
                          </div>
                          <div className="text-sm font-medium w-10 text-right">{count}</div>
                        </div>
                      );
                    })
                  }
                </div>
              ) : (
                <div className="text-center text-gray-500">No candidate status data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Responses */}
      <Card className="mb-8 shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-white to-slate-50">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-lg text-slate-800">Recent Responses</CardTitle>
          <CardDescription>Latest interview responses</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            {recentResponses.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-slate-600 border-b">
                    <th className="text-left pb-2 font-medium">Date</th>
                    <th className="text-left pb-2 font-medium">Name</th>
                    <th className="text-left pb-2 font-medium">Status</th>
                    <th className="text-left pb-2 font-medium">Duration</th>
                    <th className="text-left pb-2 font-medium">Analytics</th>
                  </tr>
                </thead>
                <tbody>
                  {recentResponses.map((response) => (
                    <tr key={String(response.id)} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="py-3 text-sm">
                        {isClient ? formatDate(response.created_at) : 'Loading...'}
                      </td>
                      <td className="py-3 text-sm font-medium">{response.name || 'Anonymous'}</td>
                      <td className="py-3 text-sm">{response.candidate_status || 'Not specified'}</td>
                      <td className="py-3 text-sm">{formatDuration(response.duration)}</td>
                      <td className="py-3 text-sm">
                        {response.is_analysed ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Analyzed</span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-gray-500">No recent responses available</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Interviews */}
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-white to-slate-50">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-lg text-slate-800">Top Interviews</CardTitle>
          <CardDescription>Interviews with most responses</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            {topInterviews.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-slate-600 border-b">
                    <th className="text-left pb-2 font-medium">Name</th>
                    <th className="text-left pb-2 font-medium">Responses</th>
                    <th className="text-left pb-2 font-medium">Status</th>
                    <th className="text-left pb-2 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {topInterviews.map((interview) => (
                    <tr key={interview.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="py-3 text-sm font-medium">{interview.name}</td>
                      <td className="py-3 text-sm">{interview.responseCount}</td>
                      <td className="py-3 text-sm">
                        {interview.is_archived ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Archived</span>
                        ) : interview.is_active ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Inactive</span>
                        )}
                      </td>
                      <td className="py-3 text-sm">
                        {isClient ? formatDate(interview.created_at) : 'Loading...'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-gray-500">No interview data available</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
