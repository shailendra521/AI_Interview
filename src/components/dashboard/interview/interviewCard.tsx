import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Copy, ArrowUpRight, Mail } from "lucide-react";
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
          className={`relative p-0 h-64 w-64 rounded-xl shrink-0 overflow-hidden border-slate-200 ${isFetching ? "opacity-80" : ""}`}
        >
          <CardContent className="p-0 h-full flex flex-col">
            <div className="w-full h-32 overflow-hidden bg-gradient-to-r from-primary to-blue-500 flex items-center justify-center">
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
                      src={img}
                      alt="Interviewer"
                      width={40}
                      height={40}
                      className="object-cover object-center"
                    />
                  </div>
                  <div className="text-sm font-medium text-slate-800">
                    Interviewer
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
