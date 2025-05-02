"use server";

import { OpenAI } from "openai";
import { ResponseService } from "@/services/responses.service";
import { InterviewService } from "@/services/interviews.service";
import { Question } from "@/types/interview";
import { Analytics } from "@/types/response";
import {
  getInterviewAnalyticsPrompt,
  SYSTEM_PROMPT,
} from "@/lib/prompts/analytics";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Initialize the server-side Supabase client
const getSupabase = () => {
  return createServerComponentClient({ cookies });
};

export async function getDashboardStats() {
  try {
    const supabase = getSupabase();
    
    // Get total interview count
    const { count: interviewCount, error: interviewError } = await supabase
      .from("interview")
      .select("*", { count: "exact", head: true });

    // Get total response count
    const { count: responseCount, error: responseError } = await supabase
      .from("response")
      .select("*", { count: "exact", head: true });

    // Get average duration
    const { data: durationData, error: durationError } = await supabase
      .from("response")
      .select("duration")
      .not("duration", "is", null);

    // Get interview status counts
    const { data: activeInterviews, error: activeError } = await supabase
      .from("interview")
      .select("id")
      .eq("is_active", true)
      .eq("is_archived", false);

    const { data: archivedInterviews, error: archivedError } = await supabase
      .from("interview")
      .select("id")
      .eq("is_archived", true);

    // Get average satisfaction rating from feedback
    const { data: satisfactionData, error: satisfactionError } = await supabase
      .from("feedback")
      .select("satisfaction")
      .not("satisfaction", "is", null);

    // Calculate response metrics by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: responsesByDate, error: responsesByDateError } = await supabase
      .from("response")
      .select("created_at")
      .gte("created_at", thirtyDaysAgo.toISOString());

    // Get candidate status distribution
    const { data: candidateStatusData, error: candidateStatusError } = await supabase
      .from("response")
      .select("candidate_status");

    // Process the data
    const totalInterviews = interviewCount || 0;
    const totalResponses = responseCount || 0;

    let averageDuration = 0;
    if (durationData && durationData.length > 0) {
      const totalDuration = durationData.reduce((sum, item) => sum + (item.duration || 0), 0);
      averageDuration = Math.round(totalDuration / durationData.length);
    }

    let averageSatisfaction = 0;
    if (satisfactionData && satisfactionData.length > 0) {
      const totalSatisfaction = satisfactionData.reduce(
        (sum, item) => sum + (item.satisfaction || 0), 
        0
      );
      averageSatisfaction = parseFloat((totalSatisfaction / satisfactionData.length).toFixed(1));
    }

    const interviewsByStatus = {
      active: activeInterviews?.length || 0,
      archived: archivedInterviews?.length || 0,
    };

    // Process responses by date
    const responsesByDateMap = {};
    if (responsesByDate) {
      responsesByDate.forEach(item => {
        const date = new Date(item.created_at).toISOString().split('T')[0];
        responsesByDateMap[date] = (responsesByDateMap[date] || 0) + 1;
      });
    }

    // Process candidate status counts
    const candidateStatusCounts = {};
    if (candidateStatusData) {
      candidateStatusData.forEach(item => {
        const status = item.candidate_status || 'Not specified';
        candidateStatusCounts[status] = (candidateStatusCounts[status] || 0) + 1;
      });
    }

    return {
      totalInterviews,
      totalResponses,
      averageDuration,
      averageSatisfaction,
      interviewsByStatus,
      responsesByDate: responsesByDateMap,
      candidateStatusCounts,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error("Failed to fetch dashboard statistics");
  }
}

export async function getRecentResponses(limit = 5) {
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
    console.error("Error fetching recent responses:", error);
    throw new Error("Failed to fetch recent responses");
  }
}

export async function getTopInterviews(limit = 5) {
  try {
    const supabase = getSupabase();
    
    // First get all interviews
    const { data: interviews, error: interviewError } = await supabase
      .from("interview")
      .select("*");

    if (interviewError) throw interviewError;

    // Get all responses
    const { data: responses, error: responseError } = await supabase
      .from('response')
      .select('interview_id');

    if (responseError) throw responseError;

    // Count responses for each interview manually
    const interviewCounts = {};
    
    if (responses) {
      responses.forEach(response => {
        const id = response.interview_id;
        interviewCounts[id] = (interviewCounts[id] || 0) + 1;
      });
    }

    // Add response count to each interview and sort
    const interviewsWithCount = interviews.map(interview => ({
      ...interview,
      responseCount: interviewCounts[interview.id] || 0,
    })).sort((a, b) => b.responseCount - a.responseCount);

    return interviewsWithCount.slice(0, limit);
  } catch (error) {
    console.error("Error fetching top interviews:", error);
    throw new Error("Failed to fetch top interviews");
  }
}

export async function getFeedbackStats() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("feedback")
      .select("satisfaction, feedback");

    if (error) throw error;

    // Count feedback by satisfaction level
    const satisfactionCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalFeedbackCount = 0;

    data.forEach(item => {
      if (item.satisfaction) {
        satisfactionCounts[item.satisfaction] = (satisfactionCounts[item.satisfaction] || 0) + 1;
        totalFeedbackCount++;
      }
    });

    return {
      satisfactionCounts,
      totalFeedbackCount,
      feedbackData: data,
    };
  } catch (error) {
    console.error("Error fetching feedback stats:", error);
    throw new Error("Failed to fetch feedback statistics");
  }
}

export async function generateInterviewAnalytics(payload: {
  callId: string;
  interviewId: string;
  transcript: string;
}) {
  const { callId, interviewId, transcript } = payload;

  try {
    const response = await ResponseService.getResponseByCallId(callId);
    const interview = await InterviewService.getInterviewById(interviewId);

    if (response.analytics) {
      return { analytics: response.analytics as Analytics, status: 200 };
    }

    const interviewTranscript = transcript || response.details?.transcript;
    const questions = interview?.questions || [];
    const mainInterviewQuestions = questions
      .map((q: Question, index: number) => `${index + 1}. ${q.question}`)
      .join("\n");

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      maxRetries: 5,
      dangerouslyAllowBrowser: true,
    });

    const prompt = getInterviewAnalyticsPrompt(
      interviewTranscript,
      mainInterviewQuestions,
    );

    const baseCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const basePromptOutput = baseCompletion.choices[0] || {};
    const content = basePromptOutput.message?.content || "";
    const analyticsResponse = JSON.parse(content);

    analyticsResponse.mainInterviewQuestions = questions.map(
      (q: Question) => q.question,
    );

    return { analytics: analyticsResponse, status: 200 };
  } catch (error) {
    console.error("Error in OpenAI request:", error);

    return { error: "internal server error", status: 500 };
  }
}
