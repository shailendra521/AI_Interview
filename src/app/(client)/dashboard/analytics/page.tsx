import { getDashboardStats, getRecentResponses, getTopInterviews, getFeedbackStats } from "@/services/analytics.service";
import AnalyticsDashboardClient from "./dashboard-client";

// This is a server component that fetches data and passes it to the client component
export default async function AnalyticsPage() {
  // Initialize with null to detect what failed
  let dashboardStats = null;
  let recentResponses = null;
  let topInterviews = null;
  let feedbackStats = null;
  let errorMessage = null;

  try {
    // Try to fetch dashboard stats
    dashboardStats = await getDashboardStats();
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    errorMessage = "There was an issue loading some of the analytics data.";
  }

  try {
    // Try to fetch recent responses
    recentResponses = await getRecentResponses(5);
  } catch (error) {
    console.error("Error fetching recent responses:", error);
    if (!errorMessage) errorMessage = "There was an issue loading some of the analytics data.";
  }

  try {
    // Try to fetch top interviews
    topInterviews = await getTopInterviews(5);
  } catch (error) {
    console.error("Error fetching top interviews:", error);
    if (!errorMessage) errorMessage = "There was an issue loading some of the analytics data.";
  }

  try {
    // Try to fetch feedback stats
    feedbackStats = await getFeedbackStats();
  } catch (error) {
    console.error("Error fetching feedback stats:", error);
    if (!errorMessage) errorMessage = "There was an issue loading some of the analytics data.";
  }

  // If all data is null, it's a complete failure
  if (!dashboardStats && !recentResponses && !topInterviews && !feedbackStats) {
    return (
      <AnalyticsDashboardClient 
        error="Failed to load analytics data. Please refresh the page or try again later."
      />
    );
  }

  // Otherwise, pass what we have and an optional warning
  return (
    <AnalyticsDashboardClient 
      initialStats={dashboardStats || undefined}
      initialRecentResponses={recentResponses || []}
      initialTopInterviews={topInterviews || []}
      initialFeedbackStats={feedbackStats || undefined}
      error={errorMessage}
    />
  );
} 
