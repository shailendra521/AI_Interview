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
  const [isHovered, setIsHovered] = useState(false);

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
            className={`relative p-4 border-neutral-800 bg-black/40 hover:shadow-lg hover:shadow-[#02563D]/20 transition-all duration-300 
            ${isFetching ? "opacity-80" : ""} 
            ${hasAwards ? "border-[#02563D]/50 bg-gradient-to-r from-black to-[#02563D]/20" : ""}`}
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-[#02563D] via-emerald-700 to-[#02563D] shadow-lg shadow-[#02563D]/20">
                  {hasAwards && (
                    <div className="absolute top-0 right-0 w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center rounded-bl-lg z-10">
                      <Award size={14} className="text-black" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{name?.substring(0, 2).toUpperCase()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-grow">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{name}</h3>
                  {hasAwards && (
                    <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-black text-xs px-2 py-0.5 rounded-full font-medium">Award Winning</span>
                  )}
                </div>
                
                <div className="flex items-center gap-3 mt-1 text-sm text-neutral-400">
                  <div className="flex items-center gap-1">
                    <Users size={14} className="text-emerald-400" />
                    <span>{responseCount || 0} responses</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Calendar size={14} className="text-emerald-400" />
                    <span>{createdAt ? formatDistanceToNow(new Date(createdAt), { addSuffix: true }) : "Recently"}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#02563D]/20 shadow-lg">
                    <Image
                      src={img || "/default-avatar.png"}
                      alt="Interviewer"
                      width={32}
                      height={32}
                      className="object-cover object-center"
                    />
                  </div>
                  <span className="ml-2 text-sm text-neutral-300 font-medium">{interviewer?.name || "Interviewer"}</span>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    className="h-8 w-8 rounded-full p-0 bg-black/50 hover:bg-[#02563D]/50 text-neutral-300 hover:text-emerald-300 transition-colors"
                    variant="soft"
                    onClick={handleEmailClick}
                  >
                    <Mail size={16} />
                  </Button>
                  
                  <Button
                    className={`h-8 w-8 rounded-full p-0 transition-colors ${
                      copied 
                        ? "bg-[#02563D] text-white" 
                        : "bg-black/50 hover:bg-[#02563D]/50 text-neutral-300 hover:text-emerald-300"
                    }`}
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
                    className="h-8 w-8 rounded-full p-0 bg-black/50 hover:bg-[#02563D]/50 text-neutral-300 hover:text-emerald-300 transition-colors"
                    variant="outline"
                    onClick={handleJumpToInterview}
                  >
                    <ArrowUpRight size={16} />
                  </Button>
                </div>
              </div>
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
          className={`relative p-0 h-64 w-64 rounded-xl shrink-0 overflow-hidden border-neutral-800 
            bg-gradient-to-br from-black via-black/90 to-black/80 backdrop-blur-sm
            hover:shadow-xl hover:shadow-[#02563D]/30 hover:border-[#02563D]/30 transition-all duration-300 
            ${isFetching ? "opacity-80" : ""} 
            ${hasAwards ? "border-[#02563D]/50" : ""}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <CardContent className="p-0 h-full flex flex-col">
            {/* Header Section */}
            <div className="w-full h-32 overflow-hidden bg-gradient-to-br from-[#02563D]/90 via-emerald-800/80 to-[#02563D]/90 flex items-center justify-center relative">
              {/* Animated gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-[#02563D]/5 to-emerald-500/10 opacity-0 
                transition-opacity duration-500 ${isHovered ? 'opacity-100' : ''}`} />
              
              {hasAwards && (
                <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-600 text-black text-xs rounded-full px-2 py-0.5 flex items-center gap-1 shadow-lg">
                  <Award size={12} className="text-black" />
                  <span className="font-medium">Award Winning</span>
                </div>
              )}
              
              <CardTitle className="text-white text-xl font-bold px-4 text-center relative z-10">
                {name}
                {isFetching && (
                  <div className="mt-2">
                    <MiniLoader />
                  </div>
                )}
              </CardTitle>
            </div>
            
            {/* Content Section */}
            <div className="flex-1 p-4 flex flex-col justify-between">
              {/* Interviewer Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#02563D]/20 shadow-lg">
                    <Image
                      src={img || "/default-avatar.png"}
                      alt="Interviewer"
                      width={40}
                      height={40}
                      className="object-cover object-center"
                    />
                  </div>
                  <div className="text-sm font-medium text-neutral-300">
                    {interviewer?.name || "Interviewer"}
                  </div>
                </div>
                <div className="text-sm font-medium bg-[#02563D]/30 text-emerald-300 rounded-full px-2.5 py-1">
                  {responseCount || 0} <span className="text-xs">Responses</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-4">
                <Button
                  onClick={copyToClipboard}
                  className="flex-1 bg-gradient-to-r from-[#02563D]/20 to-emerald-600/20 hover:from-[#02563D]/30 hover:to-emerald-600/30 
                    text-emerald-300 border border-[#02563D]/20 hover:border-[#02563D]/30 transition-all duration-300"
                  size="sm"
                >
                  {copied ? (
                    <CopyCheck size={16} className="mr-1" />
                  ) : (
                    <Copy size={16} className="mr-1" />
                  )}
                  Copy Link
                </Button>
                <Button
                  onClick={handleEmailClick}
                  className="bg-gradient-to-r from-[#02563D]/20 to-emerald-600/20 hover:from-[#02563D]/30 hover:to-emerald-600/30 
                    text-emerald-300 border border-[#02563D]/20 hover:border-[#02563D]/30 transition-all duration-300"
                  size="sm"
                >
                  <Mail size={16} />
                </Button>
                <Button
                  onClick={handleJumpToInterview}
                  className="bg-gradient-to-r from-[#02563D]/20 to-emerald-600/20 hover:from-[#02563D]/30 hover:to-emerald-600/30 
                    text-emerald-300 border border-[#02563D]/20 hover:border-[#02563D]/30 transition-all duration-300"
                  size="sm"
                >
                  <ArrowUpRight size={16} />
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
