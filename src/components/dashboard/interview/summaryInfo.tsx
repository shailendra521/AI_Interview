"use client";

import { Interview } from "@/types/interview";
import { Interviewer } from "@/types/interviewer";
import { Response } from "@/types/response";
import React, { useEffect, useState } from "react";
import { UserCircleIcon, SmileIcon, Info, ClipboardList, Clock, BarChart3 } from "lucide-react";
import { useInterviewers } from "@/contexts/interviewers.context";
import { PieChart } from "@mui/x-charts/PieChart";
import { CandidateStatus } from "@/lib/enum";
import { convertSecondstoMMSS } from "@/lib/utils";
import Image from "next/image";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import DataTable, {
  TableData,
} from "@/components/dashboard/interview/dataTable";
import { ScrollArea } from "@/components/ui/scroll-area";

type SummaryProps = {
  responses: Response[];
  interview: Interview | undefined;
};

function InfoTooltip({ content }: { content: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Info
            className="h-3 w-3 text-indigo-500 inline-block ml-1 align-middle"
            strokeWidth={2}
          />
        </TooltipTrigger>
        <TooltipContent className="bg-indigo-600 text-white font-normal p-3 rounded-lg shadow-lg border border-indigo-300">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function SummaryInfo({ responses, interview }: SummaryProps) {
  const { interviewers } = useInterviewers();
  const [interviewer, setInterviewer] = useState<Interviewer>();
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [completedInterviews, setCompletedInterviews] = useState<number>(0);
  const [sentimentCount, setSentimentCount] = useState({
    positive: 0,
    negative: 0,
    neutral: 0,
  });
  const [callCompletion, setCallCompletion] = useState({
    complete: 0,
    incomplete: 0,
    partial: 0,
  });

  const totalResponses = responses.length;

  const [candidateStatusCount, setCandidateStatusCount] = useState({
    [CandidateStatus.NO_STATUS]: 0,
    [CandidateStatus.NOT_SELECTED]: 0,
    [CandidateStatus.POTENTIAL]: 0,
    [CandidateStatus.SELECTED]: 0,
  });

  const [tableData, setTableData] = useState<TableData[]>([]);

  const prepareTableData = (responses: Response[]): TableData[] => {
    return responses.map((response) => ({
      call_id: response.call_id,
      name: response.name || "Anonymous",
      overallScore: response.analytics?.overallScore || 0,
      communicationScore: response.analytics?.communication?.score || 0,
      callSummary:
        response.analytics?.softSkillSummary ||
        response.details?.call_analysis?.call_summary ||
        "No summary available",
    }));
  };

  useEffect(() => {
    if (!interviewers || !interview) {
      return;
    }
    const interviewer = interviewers.find(
      (interviewer) => interviewer.id === interview.interviewer_id,
    );
    setInterviewer(interviewer);
  }, [interviewers, interview]);

  useEffect(() => {
    if (!responses) {
      return;
    }

    const sentimentCounter = {
      positive: 0,
      negative: 0,
      neutral: 0,
    };

    const callCompletionCounter = {
      complete: 0,
      incomplete: 0,
      partial: 0,
    };

    let totalDuration = 0;
    let completedCount = 0;

    const statusCounter = {
      [CandidateStatus.NO_STATUS]: 0,
      [CandidateStatus.NOT_SELECTED]: 0,
      [CandidateStatus.POTENTIAL]: 0,
      [CandidateStatus.SELECTED]: 0,
    };

    responses.forEach((response) => {
      const sentiment = response.details?.call_analysis?.user_sentiment;
      if (sentiment === "Positive") {
        sentimentCounter.positive += 1;
      } else if (sentiment === "Negative") {
        sentimentCounter.negative += 1;
      } else if (sentiment === "Neutral") {
        sentimentCounter.neutral += 1;
      }

      const callCompletion =
        response.details?.call_analysis?.call_completion_rating;
      if (callCompletion === "Complete") {
        callCompletionCounter.complete += 1;
      } else if (callCompletion === "Incomplete") {
        callCompletionCounter.incomplete += 1;
      } else if (callCompletion === "Partial") {
        callCompletionCounter.partial += 1;
      }

      const agentTaskCompletion =
        response.details?.call_analysis?.agent_task_completion_rating;
      if (
        agentTaskCompletion === "Complete" ||
        agentTaskCompletion === "Partial"
      ) {
        completedCount += 1;
      }

      totalDuration += response.duration;
      if (
        Object.values(CandidateStatus).includes(
          response.candidate_status as CandidateStatus,
        )
      ) {
        statusCounter[response.candidate_status as CandidateStatus]++;
      }
    });

    setSentimentCount(sentimentCounter);
    setCallCompletion(callCompletionCounter);
    setTotalDuration(totalDuration);
    setCompletedInterviews(completedCount);
    setCandidateStatusCount(statusCounter);

    const preparedData = prepareTableData(responses);
    setTableData(preparedData);
  }, [responses]);

  return (
    <div className="h-screen z-[10] mx-2">
      {responses.length > 0 ? (
        <div className="bg-gradient-to-br from-white to-slate-100 rounded-2xl min-h-[120px] p-6 shadow-lg border border-slate-200">
          <div className="flex flex-row gap-2 justify-between items-center mb-4">
            <div className="flex flex-row gap-2 items-center">
              <div className="bg-indigo-600 text-white p-2 rounded-lg">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h2 className="font-bold text-xl text-indigo-900">Overall Analysis</h2>
            </div>
            <div className="flex items-center bg-indigo-50 p-2 px-4 rounded-full shadow-sm">
              <span className="text-sm font-medium text-indigo-800">
                Interviewer: <span className="font-semibold">{interviewer?.name}</span>
              </span>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-6">
            <p className="text-sm flex items-center gap-1">
              <ClipboardList className="h-4 w-4 text-indigo-600" />
              <span className="font-medium text-gray-600">Interview Description:</span>
              <span className="font-semibold text-indigo-800">{interview?.description}</span>
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-slate-200">
            <h3 className="font-semibold text-lg mb-3 text-indigo-900 px-2">Response Details</h3>
            <ScrollArea className="h-[250px]">
              <DataTable data={tableData} interviewId={interview?.id || ""} />
            </ScrollArea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200 flex flex-col">
              <h3 className="font-semibold text-lg text-indigo-900 mb-4 border-b pb-2">Key Metrics</h3>
              
              <div className="grid grid-cols-2 gap-4 h-full">
                <div className="flex flex-col items-center justify-center p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-indigo-600" />
                    <h3 className="font-semibold text-gray-700 text-sm">Average Duration</h3>
                    <InfoTooltip content="Average time users took to complete an interview" />
                  </div>
                  <div className="text-3xl font-bold text-indigo-600 mt-2">
                    {convertSecondstoMMSS(totalDuration / responses.length)}
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    <h3 className="font-semibold text-gray-700 text-sm">Completion Rate</h3>
                    <InfoTooltip content="Percentage of interviews completed successfully" />
                  </div>
                  <div className="text-3xl font-bold text-indigo-600 mt-2">
                    {Math.round((completedInterviews / responses.length) * 10000) / 100}%
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-5 border border-slate-200 flex flex-col items-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <SmileIcon className="h-5 w-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-700">Candidate Sentiment</h3>
                <InfoTooltip content="Distribution of user sentiments during interviews" />
              </div>
              <PieChart
                colors={['#22c55e', '#eab308', '#ef4444']}
                sx={{
                  "& .MuiChartsLegend-series text": {
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.85rem !important",
                    fontWeight: 500,
                  },
                  "& .MuiChartsLegend-mark": {
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                  },
                  "& .MuiChartsAxis-tickLabel": {
                    fontFamily: "'Inter', sans-serif",
                  },
                  "& .MuiChartsLegend-label": {
                    fontFamily: "'Inter', sans-serif",
                  },
                  "& .MuiPieArc-label": {
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.8rem !important",
                    fontWeight: 600,
                    fill: "#ffffff",
                    textShadow: "0px 1px 2px rgba(0,0,0,0.5)",
                  },
                }}
                series={[
                  {
                    data: [
                      {
                        id: 0,
                        value: sentimentCount.positive,
                        label: `Positive (${sentimentCount.positive})`,
                        color: "#22c55e",
                      },
                      {
                        id: 1,
                        value: sentimentCount.neutral,
                        label: `Neutral (${sentimentCount.neutral})`,
                        color: "#eab308",
                      },
                      {
                        id: 2,
                        value: sentimentCount.negative,
                        label: `Negative (${sentimentCount.negative})`,
                        color: "#ef4444",
                      },
                    ],
                    highlightScope: { faded: "global", highlighted: "item" },
                    faded: {
                      innerRadius: 30,
                      additionalRadius: -10,
                      color: "gray",
                    },
                    innerRadius: 20,
                    paddingAngle: 0,
                    cornerRadius: 0,
                    arcLabel: (item) => {
                      const percentage = Math.round((item.value / totalResponses) * 100);
                      if (percentage < 10) return "";
                      
                      // Extract the first word of the label (e.g., "Positive" from "Positive (3)")
                      const labelText = item.label?.split(" ")[0] || "";
                      return `${labelText}: ${item.value}`;
                    },
                    arcLabelMinAngle: 20,
                  },
                ]}
                width={300}
                height={180}
                margin={{ top: 5, bottom: 5, left: 5, right: 100 }}
                slotProps={{
                  legend: {
                    direction: "column",
                    position: { vertical: "middle", horizontal: "right" },
                    padding: 0,
                    itemMarkWidth: 10,
                    itemMarkHeight: 10,
                    markGap: 5,
                    itemGap: 16,
                    labelStyle: {
                      fontSize: "0.75rem",
                      fill: "#444",
                      textAnchor: "start",
                    },
                  },
                }}
              />
            </div>
          </div>
            
          <div className="bg-white rounded-xl shadow-md p-5 border border-slate-200 flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <UserCircleIcon className="h-5 w-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-700">Candidate Selection Status</h3>
              <InfoTooltip content="Breakdown of the candidate selection status" />
            </div>
            <div className="text-sm text-center mb-3 text-gray-500">
              Total Responses: <span className="font-medium text-indigo-900">{totalResponses}</span>
            </div>
            <div className="w-full flex justify-center h-[280px]">
              <PieChart
                colors={['#22c55e', '#eab308', '#ef4444', '#9ca3af']}
                sx={{
                  "& .MuiChartsLegend-series text": {
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.85rem !important",
                    fontWeight: 500,
                  },
                  "& .MuiChartsLegend-mark": {
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                  },
                  "& .MuiChartsAxis-tickLabel": {
                    fontFamily: "'Inter', sans-serif",
                  },
                  "& .MuiChartsLegend-label": {
                    fontFamily: "'Inter', sans-serif",
                  },
                  "& .MuiPieArc-label": {
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.8rem !important",
                    fontWeight: 600,
                    fill: "#ffffff",
                    textShadow: "0px 1px 2px rgba(0,0,0,0.5)",
                  },
                }}
                series={[
                  {
                    data: [
                      {
                        id: 0,
                        value: candidateStatusCount[CandidateStatus.SELECTED],
                        label: `Selected (${candidateStatusCount[CandidateStatus.SELECTED]})`,
                        color: "#22c55e",
                      },
                      {
                        id: 1,
                        value: candidateStatusCount[CandidateStatus.POTENTIAL],
                        label: `Potential (${candidateStatusCount[CandidateStatus.POTENTIAL]})`,
                        color: "#eab308",
                      },
                      {
                        id: 2,
                        value: candidateStatusCount[CandidateStatus.NOT_SELECTED],
                        label: `Not Selected (${candidateStatusCount[CandidateStatus.NOT_SELECTED]})`,
                        color: "#ef4444",
                      },
                      {
                        id: 3,
                        value: candidateStatusCount[CandidateStatus.NO_STATUS],
                        label: `No Status (${candidateStatusCount[CandidateStatus.NO_STATUS]})`,
                        color: "#9ca3af",
                      },
                    ],
                    highlightScope: { faded: "global", highlighted: "item" },
                    faded: {
                      innerRadius: 30,
                      additionalRadius: -10,
                      color: "gray",
                    },
                    innerRadius: 20,
                    paddingAngle: 0,
                    cornerRadius: 0,
                    arcLabel: (item) => {
                      const percentage = Math.round((item.value / totalResponses) * 100);
                      if (percentage < 10) return "";
                      
                      // Extract the first word of the label (e.g., "Selected" from "Selected (3)")
                      const labelText = item.label?.split(" ")[0] || "";
                      return `${labelText}: ${item.value}`;
                    },
                    arcLabelMinAngle: 20,
                  },
                ]}
                width={700}
                height={250}
                margin={{ top: 10, bottom: 80, left: 50, right: 50 }}
                slotProps={{
                  legend: {
                    direction: "row",
                    position: { vertical: "bottom", horizontal: "middle" },
                    padding: 20,
                    itemMarkWidth: 12,
                    itemMarkHeight: 12,
                    markGap: 8,
                    itemGap: 25,
                  },
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-[60%] flex flex-col items-center justify-center bg-white rounded-2xl shadow-md p-10">
          <div className="flex flex-col items-center bg-slate-50 p-10 rounded-xl border border-slate-200">
            <Image
              src="/no-responses.png"
              alt="No responses"
              width={300}
              height={300}
              className="mb-4"
            />
            <p className="text-center text-indigo-800 font-medium mt-4">
              No responses yet. Please share with your intended respondents.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SummaryInfo;
