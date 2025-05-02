"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import InterviewAnalysis from "@/components/dashboard/interview/InterviewAnalysis";
import { ResponseService } from "@/services/responses.service";
import { InterviewService } from "@/services/interviews.service";
import { Response } from "@/types/response";
import { Interview } from "@/types/interview";

export default function InterviewPage() {
  const params = useParams();
  const [responses, setResponses] = useState<Response[]>([]);
  const [interview, setInterview] = useState<Interview>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;

      try {
        const [interviewData, responsesData] = await Promise.all([
          InterviewService.getInterview(params.id as string),
          ResponseService.getAllResponses(params.id as string)
        ]);

        setInterview(interviewData);
        setResponses(responsesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!interview || responses.length === 0) {
    return <div>No data available</div>;
  }

  const responseDetails = responses.map(response => ({
    name: response.name || "Anonymous",
    overallScore: response.analytics?.overallScore || 0,
    communicationScore: response.analytics?.communication?.score || 0,
    summary: response.analytics?.softSkillSummary || 
             response.details?.call_analysis?.call_summary || 
             "No summary available"
  }));

  return (
    <InterviewAnalysis
      candidateName={interview.name || "Unnamed Interview"}
      interviewDescription={interview.description || "No description available"}
      responseDetails={responseDetails}
      interviewer={interview.interviewer_name || "Unknown Interviewer"}
    />
  );
} 
