import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Copy, ArrowUpRight, Mail, Users, Calendar, MessageSquare } from "lucide-react";
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
  createdAt?: string;
}

const base_url = process.env.NEXT_PUBLIC_LIVE_URL;

function InterviewCard({ 
  name, 
  interviewerId, 
  id, 
  url, 
  readableSlug, 
  interviewer, 
  viewMode = "grid",
  createdAt: initialCreatedAt
}: Props) {
  const [copied, setCopied] = useState(false);
  const [responseCount, setResponseCount] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [img, setImg] = useState("");
  const [isEmailPopupOpen, setIsEmailPopupOpen] = useState(false);
  const [createdAt, setCreatedAt] = useState<string>(initialCreatedAt || "");

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
        
        // Remove mock date creation
        if (!initialCreatedAt) {
          // If createdAt wasn't provided in props, fetch it from the interview data
          try {
            const response = await fetch(`/api/interviews/${id}`);
            if (response.ok) {
              const data = await response.json();
              setCreatedAt(data.created_at);
            }
          } catch (error) {
            console.error("Failed to fetch interview creation date:", error);
          }
        }
        
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
  }, [id, initialCreatedAt]);

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
            className={`relative p-4 border-slate-200 hover:shadow-md transition-all duration-300 ${isFetching ? "opacity-80" : ""}`}
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-primary/90 to-blue-600 shadow-sm">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{name?.substring(0, 2).toUpperCase()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-grow">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-800">{name}</h3>
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
        className="block group"
        style={{
          pointerEvents: isFetching ? "none" : "auto",
          cursor: isFetching ? "default" : "pointer",
        }}
      >
        <Card 
          className={`relative h-full overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-slate-50 border border-slate-200 ${isFetching ? "opacity-80" : ""}`}
        >
          <CardContent className="p-0 h-full flex flex-col">
            <div className="w-full h-32 overflow-hidden bg-gradient-to-br from-primary/90 via-primary/85 to-primary/80 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-25"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent mix-blend-soft-light"></div>
              <CardTitle className="text-white text-xl font-bold px-6 text-center relative">
                {name}
                {isFetching && (
                  <div className="mt-2">
                    <MiniLoader />
                  </div>
                )}
              </CardTitle>
              <Button
                className="absolute top-3 right-3 h-8 w-8 rounded-full p-0 bg-white/20 text-white hover:bg-white/30"
                variant="ghost"
                onClick={handleJumpToInterview}
              >
                <ArrowUpRight size={16} />
              </Button>
            </div>

            <div className="flex-1 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md">
                    <Image
                      src={img || "/default-avatar.png"}
                      alt="Interviewer"
                      width={40}
                      height={40}
                      className="object-cover object-center"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-800">
                      {interviewer?.name || "Interviewer"}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {createdAt ? formatDistanceToNow(new Date(createdAt), { addSuffix: true }) : "Recently"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1.5">
                  <MessageSquare size={14} />
                  <span className="text-sm font-medium">{responseCount || 0}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  className="flex-1 h-9 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900"
                  onClick={handleEmailClick}
                >
                  <Mail size={14} className="mr-1.5" /> Share
                </Button>
                <Button
                  className={`flex-1 h-9 ${copied ? "bg-primary text-white" : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900"}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    copyToClipboard();
                  }}
                >
                  {copied ? (
                    <>
                      <CopyCheck size={14} className="mr-1.5" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy size={14} className="mr-1.5" /> Copy Link
                    </>
                  )}
                </Button>
              </div>
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
