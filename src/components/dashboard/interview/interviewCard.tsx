import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Copy, ArrowUpRight, Mail, Users, Award, Star, Calendar } from "lucide-react";
import { CopyCheck } from "lucide-react";
import { ResponseService } from "@/services/responses.service";
import axios from "axios";
import MiniLoader from "@/components/loaders/mini-loader/miniLoader";
import EmailPopup from "./emailPopup";
import { formatDistanceToNow } from "date-fns";

interface Props {
  name: string | null;
  interviewerId: bigint;
  id: string;
  url: string;
  readableSlug: string;
  interviewer?: any;
  viewMode?: "grid" | "list";
}

const base_url = process.env.NEXT_PUBLIC_LIVE_URL;

function InterviewCard({ name, interviewerId, id, url, readableSlug, interviewer, viewMode = "grid" }: Props) {
  const [copied, setCopied] = useState(false);
  const [responseCount, setResponseCount] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [img, setImg] = useState("");
  const [isEmailPopupOpen, setIsEmailPopupOpen] = useState(false);
  const [createdAt, setCreatedAt] = useState<string>("");
  const [hasAwards, setHasAwards] = useState<boolean>(false);

  useEffect(() => {
    // If interviewer is provided, use it directly
    if (interviewer?.image) {
      setImg(interviewer.image);
    }
    // Otherwise fetch it (backward compatibility)
    else {
      const fetchInterviewer = async () => {
        try {
          const response = await fetch(`/api/interviewers/${interviewerId}`);
          if (response.ok) {
            const data = await response.json();
            setImg(data.image);
          }
        } catch (error) {
          console.error("Failed to fetch interviewer:", error);
        }
      };
      fetchInterviewer();
    }
  }, [interviewerId, interviewer]);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const responses = await ResponseService.getAllResponses(id);
        setResponseCount(responses.length);
        
        // Set hasAwards based on responses (mock logic - this would be replaced with real criteria)
        setHasAwards(responses.length > 5);
        
        // Set creation date (mock data - would be replaced with actual data)
        setCreatedAt(new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString());
        
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

  if (viewMode === "list") {
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
            className={`relative p-4 border-slate-200 hover:shadow-md transition-all duration-300 ${isFetching ? "opacity-80" : ""} ${hasAwards ? "border-amber-200 bg-amber-50/30" : ""}`}
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-primary/90 to-blue-600 shadow-sm">
                  {hasAwards && (
                    <div className="absolute top-0 right-0 w-6 h-6 bg-amber-500 flex items-center justify-center rounded-bl-lg z-10">
                      <Award size={14} className="text-white" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{name?.substring(0, 2).toUpperCase()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-grow">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-800">{name}</h3>
                  {hasAwards && (
                    <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">Award Winning</span>
                  )}
                </div>
                
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{responseCount || 0} responses</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{createdAt ? formatDistanceToNow(new Date(createdAt), { addSuffix: true }) : "Recently"}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm">
                    <Image
                      src={img || "/default-avatar.png"}
                      alt="Interviewer"
                      width={32}
                      height={32}
                      className="object-cover object-center"
                    />
                  </div>
                  <span className="ml-2 text-sm text-slate-600">{interviewer?.name || "Interviewer"}</span>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    className="h-8 w-8 rounded-full p-0"
                    variant="soft"
                    onClick={handleEmailClick}
                  >
                    <Mail size={16} />
                  </Button>
                  
                  <Button
                    className={`h-8 w-8 rounded-full p-0 ${copied ? "bg-primary text-white" : ""}`}
                    variant="subtle"
                    onClick={(event) => {
                      event.stopPropagation();
                      event.preventDefault();
                      copyToClipboard();
                    }}
                  >
                    {copied ? <CopyCheck size={16} /> : <Copy size={16} />}
                  </Button>
                  
                  <Button
                    className="h-8 w-8 rounded-full p-0"
                    variant="outline"
                    onClick={handleJumpToInterview}
                  >
                    <ArrowUpRight size={16} />
                  </Button>
                </div>
              </div>
              
              {isFetching && (
                <div className="absolute right-4 top-4">
                  <MiniLoader />
                </div>
              )}
            </div>
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
          className={`relative p-0 h-64 w-64 rounded-xl shrink-0 overflow-hidden border-slate-200 hover:shadow-md transition-all duration-300 ${isFetching ? "opacity-80" : ""} ${hasAwards ? "border-amber-200" : ""}`}
        >
          <CardContent className="p-0 h-full flex flex-col">
            <div className="w-full h-32 overflow-hidden bg-gradient-to-r from-primary to-blue-500 flex items-center justify-center relative">
              {hasAwards && (
                <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs rounded-full px-2 py-0.5 flex items-center gap-1 shadow-md">
                  <Award size={12} className="text-white" />
                  <span>Award Winning</span>
                </div>
              )}
              <CardTitle className="text-white text-xl font-bold px-4 text-center">
                {name}
                {isFetching && (
                  <div className="mt-2">
                    <MiniLoader />
                  </div>
                )}
              </CardTitle>
            </div>
            <div className="flex-1 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                    <Image
                      src={img || "/default-avatar.png"}
                      alt="Interviewer"
                      width={40}
                      height={40}
                      className="object-cover object-center"
                    />
                  </div>
                  <div className="text-sm font-medium text-slate-800">
                    {interviewer?.name || "Interviewer"}
                  </div>
                </div>
                <div className="text-sm font-medium bg-blue-50 text-primary rounded-full px-2.5 py-1">
                  {responseCount || 0} <span className="text-xs">Responses</span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  className="flex-1 text-xs gap-1.5 h-9"
                  variant="soft"
                  onClick={handleEmailClick}
                >
                  <Mail size={14} /> Share
                </Button>
                <Button
                  className={`flex-1 text-xs gap-1.5 h-9 ${copied ? "bg-primary text-white" : ""}`}
                  variant="subtle"
                  onClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    copyToClipboard();
                  }}
                >
                  {copied ? <CopyCheck size={14} /> : <Copy size={14} />} Copy
                </Button>
              </div>
            </div>
            
            <div className="absolute top-3 right-3">
              <Button
                className="h-7 w-7 rounded-full p-0 bg-white/20 text-white hover:bg-white/30"
                variant="ghost"
                onClick={handleJumpToInterview}
              >
                <ArrowUpRight size={14} />
              </Button>
            </div>
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
