import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Copy, ArrowUpRight, Mail, Calendar, Clock } from "lucide-react";
import { CopyCheck } from "lucide-react";
import { ResponseService } from "@/services/responses.service";
import axios from "axios";
import MiniLoader from "@/components/loaders/mini-loader/miniLoader";
import { InterviewerService } from "@/services/interviewers.service";
import EmailPopup from "./emailPopup";

interface Props {
  name: string | null;
  interviewerId: bigint;
  id: string;
  url: string;
  readableSlug: string;
}

const base_url = process.env.NEXT_PUBLIC_LIVE_URL;

function InterviewCard({ name, interviewerId, id, url, readableSlug }: Props) {
  const [copied, setCopied] = useState(false);
  const [responseCount, setResponseCount] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [img, setImg] = useState("");
  const [isEmailPopupOpen, setIsEmailPopupOpen] = useState(false);

  useEffect(() => {
    const fetchInterviewer = async () => {
      const interviewer =
        await InterviewerService.getInterviewer(interviewerId);
      setImg(interviewer.image);
    };
    fetchInterviewer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const responses = await ResponseService.getAllResponses(id);
        setResponseCount(responses.length);
        if (responses.length > 0) {
          setIsFetching(true);
          for (const response of responses) {
            if (!response.is_analysed) {
              try {
                const result = await axios.post("/api/get-call", {
                  id: response.call_id,
                });

                if (result.status !== 200) {
                  throw new Error(`HTTP error! status: ${result.status}`);
                }
              } catch (error) {
                console.error(
                  `Failed to call api/get-call for response id ${response.call_id}:`,
                  error,
                );
              }
            }
          }
          setIsFetching(false);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchResponses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(
        readableSlug ? `${base_url}/call/${readableSlug}` : (url as string),
      )
      .then(
        () => {
          setCopied(true);
          toast.success(
            "The link to your interview has been copied to your clipboard.",
            {
              position: "bottom-right",
              duration: 3000,
            },
          );
          setTimeout(() => {
            setCopied(false);
          }, 2000);
        },
        (err) => {
          console.log("failed to copy", err.mesage);
        },
      );
  };

  const handleJumpToInterview = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const interviewUrl = readableSlug
      ? `/call/${readableSlug}`
      : `/call/${url}`;
    window.open(interviewUrl, "_blank");
  };

  const handleEmailClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setIsEmailPopupOpen(true);
  };

  const interviewUrl = readableSlug
    ? `${base_url}/call/${readableSlug}`
    : `${base_url}/call/${url}`;

  return (
    <>
      <a
        href={`/interviews/${id}`}
        style={{
          pointerEvents: isFetching ? "none" : "auto",
          cursor: isFetching ? "default" : "pointer",
        }}
      >
        <Card 
          hover
          shadowed
          className={`relative p-4 w-full max-w-md rounded-lg border border-slate-200 ${isFetching ? "opacity-80" : ""}`}
        >
          <CardContent className="p-0">
            {/* Header with Candidate Info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                C
              </div>
              <div>
                <h3 className="font-medium text-slate-900">{name}</h3>
                <p className="text-sm text-slate-500">Candidate</p>
              </div>
            </div>

            {/* Status and Response Count */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                Scheduled
              </span>
              <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full flex items-center gap-1">
                <span>{responseCount || 0}</span>
                <span className="text-xs">Responses</span>
              </div>
              {isFetching && (
                <div className="ml-2">
                  <MiniLoader />
                </div>
              )}
            </div>

            {/* Interview Time */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar size={16} />
                <span className="text-sm">Today</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Clock size={16} />
                <span className="text-sm">2:00 PM (30 min)</span>
              </div>
            </div>

            {/* Technical Interviewer */}
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg mb-4">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                TI
              </div>
              <span className="text-sm text-slate-700">Technical Interviewer</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleJumpToInterview(e);
                }}
              >
                <ArrowUpRight size={16} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleEmailClick(e);
                }}
              >
                <Mail size={16} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  copyToClipboard();
                }}
              >
                {copied ? <CopyCheck size={16} /> : <Copy size={16} />}
              </Button>
            </div>

            {isFetching && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <MiniLoader />
              </div>
            )}
          </CardContent>
        </Card>
      </a>
      
      <EmailPopup 
        open={isEmailPopupOpen}
        onClose={() => setIsEmailPopupOpen(false)}
        shareUrl={interviewUrl}
      />
    </>
  );
}

export default InterviewCard;
