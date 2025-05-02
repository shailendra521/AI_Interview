import { getCandidateStats, getRecentCandidates, getTopCandidateStatuses } from "@/services/candidates.service";
import CandidatesDashboardClient from "./dashboard-client";

// This is a server component that fetches data and passes it to the client component
export default async function CandidatesPage() {
  // Initialize with null to detect what failed
  let candidateStats = null;
  let recentCandidates = null;
  let topStatuses = null;
  let errorMessage = null;

  try {
    // Try to fetch candidate stats
    candidateStats = await getCandidateStats();
  } catch (error) {
    console.error("Error fetching candidate stats:", error);
    errorMessage = "There was an issue loading some of the candidate data.";
  }

  try {
    // Try to fetch recent candidates
    recentCandidates = await getRecentCandidates(10);
  } catch (error) {
    console.error("Error fetching recent candidates:", error);
    if (!errorMessage) errorMessage = "There was an issue loading some of the candidate data.";
  }

  try {
    // Try to fetch top statuses
    topStatuses = await getTopCandidateStatuses(5);
  } catch (error) {
    console.error("Error fetching top candidate statuses:", error);
    if (!errorMessage) errorMessage = "There was an issue loading some of the candidate data.";
  }

  // If all data is null, it's a complete failure
  if (!candidateStats && !recentCandidates && !topStatuses) {
    return (
      <CandidatesDashboardClient 
        error="Failed to load candidate data. Please refresh the page or try again later."
      />
    );
  }

  // Otherwise, pass what we have and an optional warning
  return (
    <CandidatesDashboardClient 
      initialStats={candidateStats || undefined}
      initialRecentCandidates={recentCandidates || []}
      initialTopStatuses={topStatuses || []}
      error={errorMessage}
    />
  );
} 
