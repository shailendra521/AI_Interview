"use client";

import {
  ArrowUpRightSquareIcon,
  AlarmClockIcon,
  XCircleIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
  BellIcon,
  ShieldAlertIcon,
  SmartphoneIcon,
  BanIcon,
  AlertOctagonIcon,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useResponses } from "@/contexts/responses.context";
import Image from "next/image";
import axios from "axios";
import { RetellWebClient } from "retell-client-js-sdk";
import MiniLoader from "../loaders/mini-loader/miniLoader";
import { toast } from "sonner";
import { isLightColor, testEmail } from "@/lib/utils";
import { ResponseService } from "@/services/responses.service";
import { Interview } from "@/types/interview";
import { FeedbackData } from "@/types/response";
import { FeedbackService } from "@/services/feedback.service";
import { FeedbackForm } from "@/components/call/feedbackForm";
import {
  TabSwitchWarning,
  useTabSwitchPrevention,
} from "./tabSwitchPrevention";
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
import { InterviewerService } from "@/services/interviewers.service";

const webClient = new RetellWebClient();

type InterviewProps = {
  interview: Interview;
};

type registerCallResponseType = {
  data: {
    registerCallResponse: {
      call_id: string;
      access_token: string;
    };
  };
};

type transcriptType = {
  role: string;
  content: string;
};

// Add interface for warnings response
interface WarningsResponse {
  warnings: string[];
}

const SpeakingEffect = () => (
  <div className="absolute -inset-1">
    <div className="absolute inset-0 rounded-full animate-ping bg-indigo-400 opacity-20"></div>
    <div className="absolute inset-0 rounded-full animate-pulse bg-indigo-400 opacity-30"></div>
    <div className="absolute -inset-2">
      <div className="w-full h-full rounded-full animate-ping-slow bg-indigo-400 opacity-10"></div>
    </div>
  </div>
);

const ToastMessage = ({ 
  message, 
  icon, 
  severity = 'normal' 
}: { 
  message: string; 
  icon: React.ReactNode;
  severity?: 'normal' | 'high';
}) => (
  <div className={`flex items-center gap-3 min-w-[300px] font-medium ${
    severity === 'high' ? 'animate-pulse' : ''
  }`}>
    <div className="flex-shrink-0 relative">
      {severity === 'high' && (
        <div className="absolute inset-0 animate-ping rounded-full bg-current opacity-25" />
      )}
      {icon}
    </div>
    <span className="flex-1">{message}</span>
  </div>
);

function Call({ interview }: InterviewProps) {
  const { createResponse } = useResponses();
  const [lastInterviewerResponse, setLastInterviewerResponse] =
    useState<string>("");
  const [lastUserResponse, setLastUserResponse] = useState<string>("");
  const [activeTurn, setActiveTurn] = useState<string>("");
  const [Loading, setLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [isValidEmail, setIsValidEmail] = useState<boolean>(false);
  const [isOldUser, setIsOldUser] = useState<boolean>(false);
  const [callId, setCallId] = useState<string>("");
  const { tabSwitchCount } = useTabSwitchPrevention();
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [interviewerImg, setInterviewerImg] = useState("");
  const [interviewTimeDuration, setInterviewTimeDuration] =
    useState<string>("1");
  const [time, setTime] = useState(0);
  const [currentTimeDuration, setCurrentTimeDuration] = useState<string>("0");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState(false);

  const lastUserResponseRef = useRef<HTMLDivElement | null>(null);

  // Add this at the start of your component to configure Sonner
  useEffect(() => {
    // Configure global toast settings
    toast.success = (message, options) => toast(message, { ...options, position: "bottom-right" });
    toast.error = (message, options) => toast(message, { ...options, position: "bottom-right" });
    toast.warning = (message, options) => toast(message, { ...options, position: "bottom-right" });
  }, []);

  useEffect(() => {
    if (lastUserResponseRef.current) {
      const { current } = lastUserResponseRef;
      current.scrollTop = current.scrollHeight;
    }
  }, [lastUserResponse]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isCalling && isStarted) {
      setIsWebcamActive(true);
      interval = setInterval(() => {
        fetch("http://localhost:5000/warnings")
          .then((res) => res.json())
          .then((data: WarningsResponse) => {
            if (data?.warnings) {
              const newWarnings = data.warnings;
              setWarnings(prev => {
                newWarnings.forEach(warning => {
                  if (!prev.includes(warning)) {
                    toast(warning, {
                      id: warning,
                    });
                  }
                });
                return newWarnings;
              });
            }
          })
          .catch((err) => {
            console.error("Failed to fetch warnings:", err);
            toast.error("Failed to monitor exam activity");
          });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
      if (isWebcamActive) {
        fetch("http://localhost:5000/stop")
          .then((res) => res.json())
          .then((data) => {
            console.log(data.message);
            setIsWebcamActive(false);
          })
          .catch((err) => console.error("Failed to stop monitoring:", err));
      }
    };
  }, [isCalling, isStarted, isWebcamActive]);

  useEffect(() => {
    let intervalId: any;
    if (isCalling) {
      intervalId = setInterval(() => setTime(time + 1), 10);
    }
    setCurrentTimeDuration(String(Math.floor(time / 100)));
    if (Number(currentTimeDuration) == Number(interviewTimeDuration) * 60) {
      webClient.stopCall();
      setIsEnded(true);
    }

    return () => clearInterval(intervalId);
  }, [isCalling, time, currentTimeDuration]);

  useEffect(() => {
    if (testEmail(email)) {
      setIsValidEmail(true);
    }
  }, [email]);

  useEffect(() => {
    webClient.on("call_started", () => {
      console.log("Call started");
      setIsCalling(true);
    });

    webClient.on("call_ended", () => {
      console.log("Call ended");
      setIsCalling(false);
      setIsEnded(true);
    });

    webClient.on("agent_start_talking", () => {
      setActiveTurn("agent");
    });

    webClient.on("agent_stop_talking", () => {
      setActiveTurn("user");
    });

    webClient.on("error", (error) => {
      console.error("An error occurred:", error);
      webClient.stopCall();
      setIsEnded(true);
      setIsCalling(false);
    });

    webClient.on("update", (update) => {
      if (update.transcript) {
        const transcripts: transcriptType[] = update.transcript;
        const roleContents: { [key: string]: string } = {};

        transcripts.forEach((transcript) => {
          roleContents[transcript?.role] = transcript?.content;
        });

        setLastInterviewerResponse(roleContents["agent"]);
        setLastUserResponse(roleContents["user"]);
      }
    });

    return () => {
      webClient.removeAllListeners();
    };
  }, []);

  const onEndCallClick = async () => {
    if (isStarted) {
      setLoading(true);
      try {
        await fetch("http://localhost:5000/stop")
          .then((res) => res.json())
          .then((data) => console.log(data.message))
          .catch((err) => console.error("Failed to stop monitoring:", err));

        webClient.stopCall();
        setIsEnded(true);
        setIsWebcamActive(false);
      } catch (error) {
        console.error("Error ending call:", error);
        toast.error("Failed to end interview properly");
      }
      setLoading(false);
    } else {
      setIsEnded(true);
    }
  };

  const startConversation = async () => {
    const data = {
      mins: interview?.time_duration,
      objective: interview?.objective,
      questions: interview?.questions.map((q) => q.question).join(", "),
      name: name || "not provided",
    };
    setLoading(true);

    const oldUserEmails: string[] = (
      await ResponseService.getAllEmails(interview.id)
    ).map((item) => item.email);
    const OldUser =
      oldUserEmails.includes(email) ||
      (interview?.respondents && !interview?.respondents.includes(email));

    if (OldUser) {
      setIsOldUser(true);
    } else {
      const registerCallResponse: registerCallResponseType = await axios.post(
        "/api/register-call",
        { dynamic_data: data, interviewer_id: interview?.interviewer_id },
      );
      if (registerCallResponse.data.registerCallResponse.access_token) {
        await webClient
          .startCall({
            accessToken:
              registerCallResponse.data.registerCallResponse.access_token,
          })
          .catch(console.error);
        setIsCalling(true);
        setIsStarted(true);

        setCallId(registerCallResponse?.data?.registerCallResponse?.call_id);

        const response = await createResponse({
          interview_id: interview.id,
          call_id: registerCallResponse.data.registerCallResponse.call_id,
          email: email,
          name: name,
        });
      } else {
        console.log("Failed to register call");
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    if (interview?.time_duration) {
      setInterviewTimeDuration(interview?.time_duration);
    }
  }, [interview]);

  useEffect(() => {
    const fetchInterviewer = async () => {
      const interviewer = await InterviewerService.getInterviewer(
        interview.interviewer_id,
      );
      setInterviewerImg(interviewer.image);
    };
    fetchInterviewer();
  }, [interview.interviewer_id]);

  useEffect(() => {
    if (isEnded) {
      const updateInterview = async () => {
        await ResponseService.saveResponse(
          { is_ended: true, tab_switch_count: tabSwitchCount },
          callId,
        );
      };

      updateInterview();
    }
  }, [isEnded]);

  const WebcamComponent = () => {
    return (
      <div className="relative w-full max-w-[800px] aspect-[16/9]">
        {!webcamError ? (
          <img
            src="http://localhost:5000/video_feed"
            alt="Webcam Feed"
            className="rounded-2xl shadow-lg w-full h-full object-cover border border-gray-200"
            onError={() => {
              setWebcamError(true);
              toast.error(
                <ToastMessage 
                  message="Failed to connect to webcam. Please ensure the monitoring server is running."
                  icon={<AlertOctagonIcon className="h-5 w-5 text-red-600 stroke-[2]" />}
                />,
                {
                  className: "bg-red-50 border-l-4 border-red-500",
                  duration: 5000,
                  style: {
                    marginBottom: '0.5rem',
                  }
                }
              );
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-200">
            <div className="text-center">
              <p className="text-red-500 mb-2 text-lg">⚠️ Webcam not available</p>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
                onClick={() => {
                  setWebcamError(false);
                }}
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleFeedbackSubmit = async (formData: Omit<FeedbackData, "interview_id">) => {
    try {
      const result = await FeedbackService.submitFeedback({
        ...formData,
        interview_id: interview.id,
      });

      if (result) {
        toast.success(
          <ToastMessage 
            message="Thank you for your feedback!"
            icon={<CheckCircleIcon className="h-5 w-5 text-green-600 stroke-[2]" />}
          />,
          {
            className: "bg-green-50 border-l-4 border-green-500",
            duration: 3000,
            style: {
              marginBottom: '0.5rem',
            }
          }
        );
        setIsFeedbackSubmitted(true);
        setIsDialogOpen(false);
      } else {
        toast.error(
          <ToastMessage 
            message="Failed to submit feedback. Please try again."
            icon={<AlertOctagonIcon className="h-5 w-5 text-red-600 stroke-[2]" />}
          />,
          {
            className: "bg-red-50 border-l-4 border-red-500",
            duration: 5000,
            style: {
              marginBottom: '0.5rem',
            }
          }
        );
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error(
        <ToastMessage 
          message="An error occurred. Please try again later."
          icon={<AlertOctagonIcon className="h-5 w-5 text-red-600 stroke-[2]" />}
        />,
        {
          className: "bg-red-50 border-l-4 border-red-500",
          duration: 5000,
          style: {
            marginBottom: '0.5rem',
          }
        }
      );
    }
  };

  useEffect(() => {
    if (warnings?.length > 0) {
      warnings.forEach((warning, index) => {
        const isPhoneWarning = warning.toLowerCase().includes('phone') || 
                              warning.toLowerCase().includes('cell') || 
                              warning.toLowerCase().includes('mobile');
        
        if (isPhoneWarning) {
          // Modern icon for phone detection
          toast.error(
            <ToastMessage 
              message={warning}
              icon={
                <div className="relative">
                  <SmartphoneIcon className="h-6 w-6 text-red-600 stroke-[2.5]" />
                  <BanIcon className="h-4 w-4 absolute -top-1 -right-1 text-red-600 stroke-[2.5]" />
                </div>
              }
              severity="high"
            />,
            {
              id: `phone-warning-${index}`,
              className: "bg-red-100 border-l-8 border-red-600",
              duration: 8000,
              position: "bottom-right",
              style: {
                marginBottom: '0.5rem',
              }
            }
          );
        } else {
          // Modern icon for general warnings
          toast.warning(
            <ToastMessage 
              message={warning}
              icon={<ShieldAlertIcon className="h-5 w-5 text-yellow-600 stroke-[2]" />}
            />,
            {
              id: `warning-${index}`,
              className: "bg-yellow-50 border-l-4 border-yellow-500",
              duration: 4000,
              position: "bottom-right",
              style: {
                marginBottom: '0.5rem',
              }
            }
          );
        }
      });
    }
  }, [warnings]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {isStarted && <TabSwitchWarning />}
      <div className="bg-white rounded-3xl md:w-[85%] w-[95%] shadow-lg relative">
        {/* Fixed Exit Button */}
        {isStarted && !isEnded && !isOldUser && (
          <div className="fixed top-6 right-12 z-50">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center gap-2 transition-all duration-300 group overflow-hidden"
                  disabled={Loading}
                >
                  <XCircleIcon className="h-5 w-5 flex-shrink-0" />
                  <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[100px] transition-all duration-300 ease-in-out">
                    Exit Interview
                  </span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This action will end the call.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={async () => {
                      await onEndCallClick();
                    }}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        <Card className="h-[90vh] rounded-3xl border border-gray-200 text-xl font-bold transition-all md:block">
          <div className="flex flex-col h-full">
            {/* Progress bar */}
            <div className="px-6 pt-4">
              <div className="h-[6px] rounded-full border-[1px] border-gray-200 bg-gray-50">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{
                    width: isEnded
                      ? "100%"
                      : `${(Number(currentTimeDuration) / (Number(interviewTimeDuration) * 60)) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Header */}
            <div className="px-6 py-3">
              <CardTitle className="flex items-center justify-between">
                <div className="text-xl md:text-2xl font-bold">
                  {interview?.name}
                </div>
                <div className="flex items-center text-sm font-normal text-gray-600">
                  <AlarmClockIcon className="w-4 h-4 mr-1" />
                  Expected duration: <span className="font-semibold ml-1">{interviewTimeDuration} mins</span> or less
                </div>
              </CardTitle>
            </div>

            {/* Initial Form */}
            {!isStarted && !isEnded && !isOldUser && (
              <div className="flex-1 flex items-center justify-center px-6">
                <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                  {interview?.logo_url && (
                    <div className="flex justify-center mb-6">
                      <Image
                        src={interview?.logo_url}
                        alt="Logo"
                        className="h-12 w-auto"
                        width={100}
                        height={48}
                      />
                    </div>
                  )}
                  
                  <div className="text-gray-700 text-sm mb-6 whitespace-pre-line">
                    {interview?.description}
                    <p className="mt-4 text-sm font-medium text-gray-900">
                      Please ensure:
                      <ul className="mt-2 list-disc list-inside space-y-1 text-gray-600">
                        <li>Your volume is turned up</li>
                        <li>You grant microphone access when prompted</li>
                        <li>You are in a quiet environment</li>
                      </ul>
                    </p>
                    <p className="mt-4 text-xs text-gray-500">
                      Note: Tab switching will be recorded
                    </p>
                  </div>

                  {!interview?.is_anonymous && (
                    <div className="space-y-4 mb-6">
                      <input
                        value={email}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                        placeholder="Enter your email address"
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <input
                        value={name}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                        placeholder="Enter your first name"
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      className="flex-1 py-2 rounded-xl text-white font-medium transition-all"
                      style={{
                        backgroundColor: interview.theme_color ?? "#4F46E5",
                        color: isLightColor(interview.theme_color ?? "#4F46E5")
                          ? "black"
                          : "white",
                      }}
                      disabled={Loading || (!interview?.is_anonymous && (!isValidEmail || !name))}
                      onClick={startConversation}
                    >
                      {!Loading ? "Start Interview" : <MiniLoader />}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Interview Content */}
            {isStarted && !isEnded && !isOldUser && (
              <div className="flex-1 px-6 pb-6">
                <div className="flex w-full gap-6 h-full">
                  {/* Left side - Interviewer */}
                  <div className="w-[40%] flex flex-col">
                    <div className="flex-grow mb-4 text-[22px] md:text-[26px] overflow-y-auto">
                      {lastInterviewerResponse}
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        {activeTurn === "agent" && <SpeakingEffect />}
                        <Image
                          src={interviewerImg}
                          alt="Image of the interviewer"
                          width={100}
                          height={100}
                          className={`rounded-full object-cover relative ${
                            activeTurn === "agent" ? "ring-4 ring-indigo-400 ring-opacity-50" : ""
                          }`}
                        />
                      </div>
                      <div className="font-semibold mt-2">Interviewer</div>
                    </div>
                  </div>

                  {/* Right side - User */}
                  <div className="w-[60%] flex flex-col h-full">
                    {/* Fixed Video Section */}
                    <div className="sticky top-0 bg-white pt-4 pb-6 z-10">
                      <div className="flex flex-col items-center">
                        <WebcamComponent />
                        <div className="font-semibold mt-2">You</div>
                      </div>
                    </div>

                    {/* Scrollable Transcript Section */}
                    <div className="flex-1 overflow-y-auto">
                      <div
                        ref={lastUserResponseRef}
                        className="text-[22px] md:text-[26px] pr-4"
                      >
                        {lastUserResponse}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Thank You Screen */}
            {isEnded && !isOldUser && (
              <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-white to-indigo-50/30">
                <div className="text-center max-w-2xl mx-auto px-6">
                  <div className="mb-8 transform animate-bounce">
                    <CheckCircleIcon className="h-16 w-16 mx-auto text-indigo-500" />
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-500">
                        {isStarted
                          ? "Thank you for completing the interview!"
                          : "Thank you for considering."}
                      </h3>
                      <p className="text-gray-600 text-lg">
                        Your participation is valuable to us. We appreciate your time and effort.
                      </p>
                    </div>

                    {!isFeedbackSubmitted && (
                      <div className="mt-8">
                        <p className="text-gray-600 mb-4">
                          Before you go, would you like to share your experience?
                        </p>
                        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                          <AlertDialogTrigger asChild>
                            <Button
                              className="bg-white hover:bg-indigo-50 text-indigo-600 border-2 border-indigo-200 px-8 py-4 rounded-2xl text-lg font-medium transition-all duration-300 hover:shadow-lg hover:border-indigo-300 hover:scale-105"
                              onClick={() => setIsDialogOpen(true)}
                            >
                              Provide Feedback
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-2xl">
                            <FeedbackForm email={email} onSubmit={handleFeedbackSubmit} />
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}

                    {isFeedbackSubmitted && (
                      <div className="mt-4 text-green-600 flex items-center justify-center gap-2">
                        <CheckCircleIcon className="h-5 w-5" />
                        <span>Thank you for your feedback!</span>
                      </div>
                    )}

                    <div className="mt-8 pt-8 border-t border-gray-100">
                      <p className="text-gray-500 text-sm">
                        You can safely close this tab now.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Already Responded Screen */}
            {isOldUser && (
              <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-white to-red-50/30">
                <div className="text-center max-w-2xl mx-auto px-6">
                  <XCircleIcon className="h-16 w-16 mx-auto mb-6 text-red-500" />
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Already Participated
                    </h3>
                    <p className="text-gray-600 text-lg">
                      It looks like you have already participated in this interview or are not eligible to respond.
                    </p>
                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <p className="text-gray-500">
                        You can safely close this tab now.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Footer */}
        <a
          className="flex justify-center items-center gap-2 py-3 text-gray-600 hover:text-gray-900 transition-colors"
          href="https://folo-up.co/"
          target="_blank"
        >
          <span className="font-medium">
            Powered by <span className="font-bold">Talent<span className="text-indigo-600">AI</span></span>
          </span>
          <ArrowUpRightSquareIcon className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
}

export default Call;
