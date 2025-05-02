"use server";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Initialize the server-side Supabase client
const getSupabase = () => {
  return createServerComponentClient({ cookies });
};

export async function getCandidateStats() {
  try {
    const supabase = getSupabase();
    
    // Get total candidate count
    const { count: candidateCount, error: candidateError } = await supabase
      .from("response")
      .select("*", { count: "exact", head: true });

    // Get candidates by status
    const { data: statusData, error: statusError } = await supabase
      .from("response")
      .select("candidate_status");

    // Get average duration of interviews
    const { data: durationData, error: durationError } = await supabase
      .from("response")
      .select("duration")
      .not("duration", "is", null);

    // Get candidates by email domain (for company stats)
    const { data: emailData, error: emailError } = await supabase
      .from("response")
      .select("email");

    // Process the data
    const totalCandidates = candidateCount || 0;

    // Process candidate status counts
    const statusCounts = {};
    if (statusData) {
      statusData.forEach(item => {
        const status = item.candidate_status || 'Not specified';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
    }

    // Calculate average duration
    let averageDuration = 0;
    if (durationData && durationData.length > 0) {
      const totalDuration = durationData.reduce((sum, item) => sum + (item.duration || 0), 0);
      averageDuration = Math.round(totalDuration / durationData.length);
    }

    // Process email domains
    const domainCounts = {};
    if (emailData) {
      emailData.forEach(item => {
        if (item.email) {
          const domain = item.email.split('@')[1] || 'unknown';
          domainCounts[domain] = (domainCounts[domain] || 0) + 1;
        }
      });
    }

    return {
      totalCandidates,
      statusCounts,
      averageDuration,
      domainCounts
    };
  } catch (error) {
    console.error("Error fetching candidate stats:", error);
    throw new Error("Failed to fetch candidate statistics");
  }
}

export async function getRecentCandidates(limit = 10) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("response")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching recent candidates:", error);
    throw new Error("Failed to fetch recent candidates");
  }
}

export async function getCandidatesByStatus(status: string, limit = 20) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("response")
      .select("*")
      .eq("candidate_status", status)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching candidates with status ${status}:`, error);
    throw new Error(`Failed to fetch candidates with status ${status}`);
  }
}

export async function getTopCandidateStatuses(limit = 5) {
  try {
    const supabase = getSupabase();
    
    // Get candidate status counts
    const { data: statusData, error: statusError } = await supabase
      .from("response")
      .select("candidate_status");

    if (statusError) throw statusError;

    // Count statuses manually
    const statusCounts = {};
    
    if (statusData) {
      statusData.forEach(item => {
        const status = item.candidate_status || 'Not specified';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
    }

    // Convert to array and sort
    const sortedStatuses = Object.entries(statusCounts)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return sortedStatuses;
  } catch (error) {
    console.error("Error fetching top candidate statuses:", error);
    throw new Error("Failed to fetch top candidate statuses");
  }
} 
