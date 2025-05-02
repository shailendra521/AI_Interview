"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, Users, Mail, Clock, Award, User, Filter, Briefcase } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Response } from "@/types/response";

interface CandidatesDashboardProps {
  initialStats?: {
    totalCandidates: number;
    statusCounts: Record<string, number>;
    averageDuration: number;
    domainCounts: Record<string, number>;
  };
  initialRecentCandidates?: Response[];
  initialTopStatuses?: { status: string; count: number }[];
  error?: string;
}

export default function CandidatesDashboardClient({
  initialStats,
  initialRecentCandidates = [],
  initialTopStatuses = [],
  error
}: CandidatesDashboardProps) {
  // Client-side state to ensure hydration consistency
  const [isClient, setIsClient] = useState(false);
  
  // If we have an error, we'll show an error message
  const [errorMessage] = useState(error);
  
  // Use the pre-fetched data directly
  const stats = initialStats || {
    totalCandidates: 0,
    statusCounts: {},
    averageDuration: 0,
    domainCounts: {}
  };
  
  const recentCandidates = initialRecentCandidates;
  const topStatuses = initialTopStatuses;

  // Set isClient to true after component mounts to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatDuration = (seconds: number) => {
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

  // Get top company domains
  const topDomains = Object.entries(stats.domainCounts || {})
    .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
    .slice(0, 5);

  // Get total candidates
  const totalCandidates = stats.totalCandidates || 0;

  if (errorMessage) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Candidates Dashboard</h1>
            <p className="text-slate-500 mt-1">Overview and insights on all your candidates</p>
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
          <h1 className="text-2xl font-bold text-slate-800">Candidates Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview and insights on all your candidates</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-50">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="ml-3">
                <div className="text-2xl font-bold">{totalCandidates}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unique Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-50">
                <Briefcase className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <div className="text-2xl font-bold">{Object.keys(stats.domainCounts || {}).length}</div>
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
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div className="ml-3">
                <div className="text-2xl font-bold">{formatDuration(stats.averageDuration)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-purple-50">
                <Filter className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <div className="text-2xl font-bold">{Object.keys(stats.statusCounts || {}).length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* Top Candidate Statuses */}
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-lg text-slate-800">Top Candidate Statuses</CardTitle>
            <CardDescription>Most common candidate outcomes</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 flex items-center justify-center overflow-y-auto">
              {topStatuses.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 w-full">
                  {topStatuses.map(({ status, count }, index) => {
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
                                width: `${(count / totalCandidates) * 100}%`,
                                transition: 'width 1s ease-in-out'
                              }} 
                            />
                          </div>
                        </div>
                        <div className="text-sm font-medium w-10 text-right">{count}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-500">No status data available</div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Top Company Domains */}
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-lg text-slate-800">Top Companies</CardTitle>
            <CardDescription>Most common email domains</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 flex items-center justify-center overflow-y-auto">
              {topDomains.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 w-full">
                  {topDomains.map(([domain, count], index) => {
                    // Generate a different color for each domain
                    const colors = [
                      'from-blue-400 to-blue-500',
                      'from-green-400 to-green-500',
                      'from-amber-400 to-amber-500',
                      'from-cyan-400 to-cyan-500',
                      'from-rose-400 to-rose-500',
                    ];
                    const colorIndex = index % colors.length;
                    
                    return (
                      <div key={domain} className="flex items-center">
                        <div className="w-36 truncate text-sm font-medium">
                          {domain}
                        </div>
                        <div className="w-[55%] mx-2">
                          <div className="h-6 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                            <div 
                              className={`h-full bg-gradient-to-r ${colors[colorIndex]} shadow-sm`}
                              style={{ 
                                width: `${(count as number / totalCandidates) * 100}%`,
                                transition: 'width 1s ease-in-out'
                              }} 
                            />
                          </div>
                        </div>
                        <div className="text-sm font-medium w-10 text-right">{count}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-500">No company domain data available</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Candidate Source Distribution (placeholder with fake data) */}
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-lg text-slate-800">Candidate Status</CardTitle>
            <CardDescription>Status breakdown visualization</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 flex flex-col justify-center items-center">
              <div className="grid grid-cols-2 gap-4 w-full">
                {Object.entries(stats.statusCounts || {})
                  .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
                  .slice(0, 4)
                  .map(([status, count], index) => {
                    // Generate a different color for each status
                    const colors = [
                      'bg-green-500',
                      'bg-blue-500',
                      'bg-purple-500',
                      'bg-pink-500',
                    ];
                    const colorIndex = index % colors.length;
                    
                    return (
                      <div key={status} className="flex flex-col items-center">
                        <div className={`w-16 h-16 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white text-sm font-medium shadow-md`}>
                          {Math.round((count as number / totalCandidates) * 100)}%
                        </div>
                        <div className="mt-2 text-xs font-medium text-center">
                          {status.replace(/_/g, ' ')}
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Candidates */}
      <Card className="mb-8 shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-white to-slate-50">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-lg text-slate-800">Recent Candidates</CardTitle>
          <CardDescription>Latest candidate submissions</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            {recentCandidates.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-slate-600 border-b">
                    <th className="text-left pb-2 font-medium">Date</th>
                    <th className="text-left pb-2 font-medium">Name</th>
                    <th className="text-left pb-2 font-medium">Email</th>
                    <th className="text-left pb-2 font-medium">Status</th>
                    <th className="text-left pb-2 font-medium">Duration</th>
                    <th className="text-left pb-2 font-medium">Analytics</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCandidates.map((candidate) => (
                    <tr key={String(candidate.id)} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="py-3 text-sm">
                        {isClient ? formatDate(candidate.created_at as string) : 'Loading...'}
                      </td>
                      <td className="py-3 text-sm font-medium">{candidate.name || 'Anonymous'}</td>
                      <td className="py-3 text-sm text-blue-600">{candidate.email || 'No email'}</td>
                      <td className="py-3 text-sm">
                        <StatusBadge status={candidate.candidate_status} />
                      </td>
                      <td className="py-3 text-sm">{formatDuration(candidate.duration)}</td>
                      <td className="py-3 text-sm">
                        {candidate.is_analysed ? (
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
              <div className="text-center py-8 text-gray-500">No recent candidates available</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Status Breakdown */}
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-white to-slate-50">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-lg text-slate-800">Status Breakdown</CardTitle>
          <CardDescription>Complete status distribution</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            {Object.keys(stats.statusCounts || {}).length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-slate-600 border-b">
                    <th className="text-left pb-2 font-medium">Status</th>
                    <th className="text-left pb-2 font-medium">Count</th>
                    <th className="text-left pb-2 font-medium">Percentage</th>
                    <th className="text-left pb-2 font-medium">Distribution</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats.statusCounts || {})
                    .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
                    .map(([status, count]) => (
                      <tr key={status} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="py-3 text-sm font-medium">
                          <StatusBadge status={status} />
                        </td>
                        <td className="py-3 text-sm">{count}</td>
                        <td className="py-3 text-sm">
                          {Math.round((count as number / totalCandidates) * 100)}%
                        </td>
                        <td className="py-3 text-sm w-1/3">
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-400 to-blue-500"
                              style={{ 
                                width: `${(count as number / totalCandidates) * 100}%`
                              }} 
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-gray-500">No status data available</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component to display status badges with appropriate colors
function StatusBadge({ status }: { status: string }) {
  if (!status) return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Unknown</span>;
  
  const formattedStatus = status.replace(/_/g, ' ');
  
  // Color mapping based on status
  const colorMap: Record<string, string> = {
    'hired': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'interviewing': 'bg-blue-100 text-blue-800',
    'offer sent': 'bg-purple-100 text-purple-800',
    'not qualified': 'bg-gray-100 text-gray-800',
    'in review': 'bg-amber-100 text-amber-800',
    'completed': 'bg-teal-100 text-teal-800',
    'shortlisted': 'bg-cyan-100 text-cyan-800',
  };
  
  // Default to blue if no specific mapping
  const colorClass = colorMap[formattedStatus.toLowerCase()] || 'bg-blue-100 text-blue-800';
  
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${colorClass}`}>
      {formattedStatus}
    </span>
  );
} 
