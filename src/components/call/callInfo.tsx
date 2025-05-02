"use client";

import React, { useEffect, useState } from "react";
import { Analytics, CallData } from "@/types/response";
import axios from "axios";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import ReactAudioPlayer from "react-audio-player";
import { DownloadIcon, TrashIcon, ArrowLeft, BadgeInfo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ResponseService } from "@/services/responses.service";
import { useRouter } from "next/navigation";
import LoaderWithText from "@/components/loaders/loader-with-text/loaderWithText";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { CircularProgress } from "@nextui-org/react";
import QuestionAnswerCard from "@/components/dashboard/interview/questionAnswerCard";
import { marked } from "marked";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CandidateStatus } from "@/lib/enum";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type CallProps = {
  call_id: string;
  onDeleteResponse: (deletedCallId: string) => void;
  onCandidateStatusChange: (callId: string, newStatus: string) => void;
};

function CallInfo({
  call_id,
  onDeleteResponse,
  onCandidateStatusChange,
}: CallProps) {
  const [call, setCall] = useState<CallData>();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [isClicked, setIsClicked] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [candidateStatus, setCandidateStatus] = useState<string>("");
  const [interviewId, setInterviewId] = useState<string>("");
  const [tabSwitchCount, setTabSwitchCount] = useState<number>();

  useEffect(() => {
    const fetchResponses = async () => {
      setIsLoading(true);
      setCall(undefined);
      setEmail("");
      setName("");

      try {
        const response = await axios.post("/api/get-call", { id: call_id });
        setCall(response.data.callResponse);
        setAnalytics(response.data.analytics);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResponses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call_id]);

  useEffect(() => {
    const fetchEmail = async () => {
      setIsLoading(true);
      try {
        const response = await ResponseService.getResponseByCallId(call_id);
        setEmail(response.email);
        setName(response.name);
        setCandidateStatus(response.candidate_status);
        setInterviewId(response.interview_id);
        setTabSwitchCount(response.tab_switch_count);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call_id]);

  useEffect(() => {
    const replaceAgentAndUser = (transcript: string, name: string): string => {
      const agentReplacement = "**AI interviewer:**";
      const userReplacement = `**${name}:**`;

      // Replace "Agent:" with "AI interviewer:" and "User:" with the variable `${name}:`
      let updatedTranscript = transcript
        .replace(/Agent:/g, agentReplacement)
        .replace(/User:/g, userReplacement);

      // Add space between the dialogues
      updatedTranscript = updatedTranscript.replace(/(?:\r\n|\r|\n)/g, "\n\n");

      return updatedTranscript;
    };

    if (call && name) {
      setTranscript(replaceAgentAndUser(call?.transcript as string, name));
    }
  }, [call, name]);

  const onDeleteResponseClick = async () => {
    try {
      const response = await ResponseService.getResponseByCallId(call_id);

      if (response) {
        const interview_id = response.interview_id;

        await ResponseService.deleteResponse(call_id);

        router.push(`/interviews/${interview_id}`);

        onDeleteResponse(call_id);
      }

      toast.success("Response deleted successfully.", {
        position: "bottom-right",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error deleting response:", error);

      toast.error("Failed to delete the response.", {
        position: "bottom-right",
        duration: 3000,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case CandidateStatus.NOT_SELECTED:
        return "bg-red-500";
      case CandidateStatus.POTENTIAL:
        return "bg-amber-500";
      case CandidateStatus.SELECTED:
        return "bg-emerald-500";
      default:
        return "bg-gray-400";
    }
  };

  const getSentimentColor = (sentiment: string | undefined) => {
    if (!sentiment) return "text-gray-400";
    switch (sentiment) {
      case "Neutral":
        return "text-amber-500";
      case "Negative":
        return "text-red-500";
      case "Positive":
        return "text-emerald-500";
      default:
        return "text-gray-400";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[75vh] w-full">
        <LoaderWithText />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-24 max-w-7xl">
      <div className="flex items-center justify-between py-6">
        <button
          onClick={() => router.push(`/interviews/${interviewId}`)}
          className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="font-medium">Back to Summary</span>
        </button>
        
        {(tabSwitchCount ?? 0) > 0 && (
          <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-sm font-medium">
            <BadgeInfo className="h-4 w-4" />
            <span>Tab Switching Detected ({tabSwitchCount})</span>
          </div>
        )}
      </div>

      <Card className="mb-6 border-none shadow-md bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-indigo-100">
                <AvatarFallback className="bg-indigo-600 text-white">
                  {name ? name[0] : "A"}
                </AvatarFallback>
              </Avatar>
              <div>
                {name && <h2 className="text-lg font-semibold">{name}</h2>}
                {email && <p className="text-sm text-gray-500">{email}</p>}
              </div>
            </div>
            
            <div className="flex items-center gap-3 self-end md:self-auto">
              <Select
                value={candidateStatus}
                onValueChange={async (newValue: string) => {
                  setCandidateStatus(newValue);
                  await ResponseService.updateResponse(
                    { candidate_status: newValue },
                    call_id,
                  );
                  onCandidateStatusChange(call_id, newValue);
                }}
              >
                <SelectTrigger className="w-[180px] rounded-lg border border-gray-200">
                  <SelectValue placeholder="Set Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CandidateStatus.NO_STATUS}>
                    <div className="flex items-center">
                      <div className="w-2.5 h-2.5 bg-gray-400 rounded-full mr-2" />
                      No Status
                    </div>
                  </SelectItem>
                  <SelectItem value={CandidateStatus.NOT_SELECTED}>
                    <div className="flex items-center">
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full mr-2" />
                      Not Selected
                    </div>
                  </SelectItem>
                  <SelectItem value={CandidateStatus.POTENTIAL}>
                    <div className="flex items-center">
                      <div className="w-2.5 h-2.5 bg-amber-500 rounded-full mr-2" />
                      Potential
                    </div>
                  </SelectItem>
                  <SelectItem value={CandidateStatus.SELECTED}>
                    <div className="flex items-center">
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-2" />
                      Selected
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={isClicked}
                    variant="destructive"
                    size="icon"
                    className="h-9 w-9"
                  >
                    <TrashIcon size={16} />
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently
                      delete this response.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={onDeleteResponseClick}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Interview Recording</h3>
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
              {call?.recording_url ? (
                <>
                  <ReactAudioPlayer 
                    src={call.recording_url} 
                    controls 
                    className="flex-grow"
                  />
                  <a
                    href={call.recording_url}
                    download=""
                    aria-label="Download"
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <DownloadIcon size={18} />
                  </a>
                </>
              ) : (
                <p className="text-gray-500 text-sm">No recording available</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="transcript">Transcript</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="space-y-6">
          <Card className="border-none shadow-md bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">General Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {analytics?.overallScore !== undefined && (
                  <div className="flex flex-col gap-3 p-5 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
                    <div className="flex flex-row gap-4 items-center">
                      <CircularProgress
                        classNames={{
                          svg: "w-20 h-20 drop-shadow-sm",
                          indicator: "stroke-indigo-600",
                          track: "stroke-indigo-100",
                          value: "text-xl font-semibold text-indigo-600",
                        }}
                        value={analytics.overallScore}
                        strokeWidth={4}
                        showValueLabel={true}
                        formatOptions={{ signDisplay: "never" }}
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">Overall Hiring Score</h3>
                        <p className="text-sm text-gray-500">Based on interview performance</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Feedback</h4>
                      {analytics?.overallFeedback ? (
                        <p className="text-sm text-gray-600">{analytics.overallFeedback}</p>
                      ) : (
                        <Skeleton className="w-full h-[40px]" />
                      )}
                    </div>
                  </div>
                )}

                {analytics?.communication && (
                  <div className="flex flex-col gap-3 p-5 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
                    <div className="flex flex-row gap-4 items-center">
                      <CircularProgress
                        classNames={{
                          svg: "w-20 h-20 drop-shadow-sm",
                          indicator: "stroke-indigo-600",
                          track: "stroke-indigo-100",
                          value: "text-xl font-semibold text-indigo-600",
                        }}
                        value={analytics.communication.score}
                        maxValue={10}
                        minValue={0}
                        strokeWidth={4}
                        showValueLabel={true}
                        valueLabel={
                          <div className="flex items-baseline">
                            {analytics.communication.score}
                            <span className="text-sm ml-0.5">/10</span>
                          </div>
                        }
                        formatOptions={{ signDisplay: "never" }}
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">Communication</h3>
                        <p className="text-sm text-gray-500">Clarity and articulation</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Feedback</h4>
                      {analytics.communication.feedback ? (
                        <p className="text-sm text-gray-600">{analytics.communication.feedback}</p>
                      ) : (
                        <Skeleton className="w-full h-[40px]" />
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 p-5 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="font-medium text-gray-900">User Sentiment</h3>
                      <div className={`w-3 h-3 rounded-full ${getSentimentColor(call?.call_analysis?.user_sentiment)}`}></div>
                      <span className={`text-sm font-medium ${getSentimentColor(call?.call_analysis?.user_sentiment)}`}>
                        {call?.call_analysis?.user_sentiment || "Unknown"}
                      </span>
                    </div>
                    
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Call Summary</h4>
                      {call?.call_analysis?.call_summary ? (
                        <p className="text-sm text-gray-600">{call.call_analysis.call_summary}</p>
                      ) : (
                        <Skeleton className="w-full h-[40px]" />
                      )}
                    </div>
                    
                    {call?.call_analysis?.call_completion_rating_reason && (
                      <div className="mt-3 text-sm text-gray-600">
                        {call.call_analysis.call_completion_rating_reason}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="questions">
          <Card className="border-none shadow-md bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Question Responses</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics?.questionSummaries && analytics.questionSummaries.length > 0 ? (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {analytics.questionSummaries.map((qs, index) => (
                    <QuestionAnswerCard
                      key={index}
                      questionNumber={index + 1}
                      question={qs.question}
                      answer={qs.summary}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No question summaries available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transcript">
          <Card className="border-none shadow-md bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Full Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[60vh] overflow-y-auto bg-slate-50 rounded-lg p-6">
                {transcript ? (
                  <div
                    className="prose prose-sm max-w-none prose-headings:text-indigo-600 prose-strong:text-gray-800"
                    dangerouslySetInnerHTML={{ __html: marked(transcript) }}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No transcript available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CallInfo;
