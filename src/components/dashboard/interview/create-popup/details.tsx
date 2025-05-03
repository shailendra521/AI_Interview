import React, { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useInterviewers } from "@/contexts/interviewers.context";
import { InterviewBase, Question } from "@/types/interview";
import { ChevronRight, ChevronLeft, Info, Upload, Clock, HelpCircle } from "lucide-react";
import Image from "next/image";
import { CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "../../../ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import FileUpload from "../fileUpload";
import Modal from "@/components/dashboard/Modal";
import InterviewerDetailsModal from "@/components/dashboard/interviewer/interviewerDetailsModal";
import { Interviewer } from "@/types/interviewer";

interface Props {
  open: boolean;
  setLoading: (loading: boolean) => void;
  interviewData: InterviewBase;
  setInterviewData: (interviewData: InterviewBase) => void;
  isUploaded: boolean;
  setIsUploaded: (isUploaded: boolean) => void;
  fileName: string;
  setFileName: (fileName: string) => void;
}

function DetailsPopup({
  open,
  setLoading,
  interviewData,
  setInterviewData,
  isUploaded,
  setIsUploaded,
  fileName,
  setFileName,
}: Props) {
  const { interviewers } = useInterviewers();
  const [isClicked, setIsClicked] = useState(false);
  const [openInterviewerDetails, setOpenInterviewerDetails] = useState(false);
  const [interviewerDetails, setInterviewerDetails] = useState<Interviewer>();

  const [name, setName] = useState(interviewData.name);
  const [selectedInterviewer, setSelectedInterviewer] = useState(
    interviewData.interviewer_id,
  );
  const [objective, setObjective] = useState(interviewData.objective);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(
    interviewData.is_anonymous,
  );
  const [numQuestions, setNumQuestions] = useState(
    interviewData.question_count == 0
      ? ""
      : String(interviewData.question_count),
  );
  const [duration, setDuration] = useState(interviewData.time_duration);
  const [uploadedDocumentContext, setUploadedDocumentContext] = useState("");

  const slideLeft = (id: string, value: number) => {
    var slider = document.getElementById(`${id}`);
    if (slider) {
      slider.scrollLeft = slider.scrollLeft - value;
    }
  };

  const slideRight = (id: string, value: number) => {
    var slider = document.getElementById(`${id}`);
    if (slider) {
      slider.scrollLeft = slider.scrollLeft + value;
    }
  };

  const onGenrateQuestions = async () => {
    setLoading(true);

    const data = {
      name: name.trim(),
      objective: objective.trim(),
      number: numQuestions,
      context: uploadedDocumentContext,
    };

    const generatedQuestions = (await axios.post(
      "/api/generate-interview-questions",
      data,
    )) as any;

    const generatedQuestionsResponse = JSON.parse(
      generatedQuestions?.data?.response,
    );

    const updatedQuestions = generatedQuestionsResponse.questions.map(
      (question: Question) => ({
        id: uuidv4(),
        question: question.question.trim(),
        follow_up_count: 1,
      }),
    );

    const updatedInterviewData = {
      ...interviewData,
      name: name.trim(),
      objective: objective.trim(),
      questions: updatedQuestions,
      interviewer_id: selectedInterviewer,
      question_count: Number(numQuestions),
      time_duration: duration,
      description: generatedQuestionsResponse.description,
      is_anonymous: isAnonymous,
    };
    setInterviewData(updatedInterviewData);
  };

  const onManual = () => {
    setLoading(true);

    const updatedInterviewData = {
      ...interviewData,
      name: name.trim(),
      objective: objective.trim(),
      questions: [{ id: uuidv4(), question: "", follow_up_count: 1 }],
      interviewer_id: selectedInterviewer,
      question_count: Number(numQuestions),
      time_duration: String(duration),
      description: "",
      is_anonymous: isAnonymous,
    };
    setInterviewData(updatedInterviewData);
  };

  const isFormValid = name && 
    objective && 
    numQuestions && 
    duration && 
    selectedInterviewer != BigInt(0);

  useEffect(() => {
    if (!open) {
      setName("");
      setSelectedInterviewer(BigInt(0));
      setObjective("");
      setIsAnonymous(false);
      setNumQuestions("");
      setDuration("");
      setIsClicked(false);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [open]);

  return (
    <TooltipProvider>
      <div className="bg-white rounded-xl shadow-lg p-3 sm:p-5 w-[95vw] sm:w-full max-w-2xl mx-auto">
        <div className="max-h-[85vh] sm:max-h-[80vh] overflow-y-auto pr-1 -mr-1">
          <h1 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6 text-gray-800">Create an Interview</h1>
          
          <div className="space-y-4 sm:space-y-5">
            {/* Interview Name Section */}
            <div className="space-y-2">
              <Label htmlFor="interviewName" className="text-sm font-medium">
                Interview Name
              </Label>
              <Input
                id="interviewName"
                type="text"
                className="w-full border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm sm:text-base"
                placeholder="e.g. Frontend Developer Interview"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                onBlur={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value.trim())}
              />
            </div>

            {/* Interviewer Selection Section */}
            <div className="space-y-2">
              <div className="flex items-center">
                <Label className="text-sm font-medium">Select an Interviewer</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" className="p-0 h-auto ml-2">
                      <HelpCircle size={14} className="text-gray-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[200px] text-xs">Choose an interviewer who will conduct this interview session</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              <div className="relative flex items-center bg-gray-50 p-2 sm:p-4 rounded-lg">
                <button
                  onClick={() => slideLeft("slider-1", 150)}
                  className="absolute left-1 sm:left-2 p-1.5 sm:p-2 rounded-full bg-white shadow-md text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all z-10"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <div
                  id="slider-1"
                  className="flex gap-3 sm:gap-6 overflow-x-auto hide-scrollbar scroll-smooth px-8 sm:px-10 py-2 min-h-[140px] sm:min-h-[160px] items-center"
                >
                  {interviewers.map((item) => (
                    <div
                      key={item.id}
                      className="flex-shrink-0 cursor-pointer group w-[100px] sm:w-[120px]"
                      onClick={() => {
                        setSelectedInterviewer(item.id);
                      }}
                    >
                      <div className="relative">
                        <div
                          className={`w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] rounded-xl overflow-hidden transition-all duration-200 ${
                            selectedInterviewer === item.id
                              ? "ring-4 ring-indigo-600 ring-offset-2 sm:ring-offset-4 scale-105 bg-white"
                              : "ring-2 ring-gray-200 hover:ring-indigo-200 hover:scale-105"
                          }`}
                        >
                          <Image
                            src={item.image}
                            alt={`${item.name} avatar`}
                            width={120}
                            height={120}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {selectedInterviewer === item.id && (
                          <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-indigo-600 text-white p-1 sm:p-1.5 rounded-full shadow-lg">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <p className={`text-xs sm:text-sm font-medium truncate w-full ${
                          selectedInterviewer === item.id ? "text-indigo-600" : "text-gray-700"
                        }`}>
                          {item.name}
                        </p>
                        <div className="flex items-center justify-center gap-1">
                          <p className="text-[10px] sm:text-xs text-gray-500">HR</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setInterviewerDetails(item);
                              setOpenInterviewerDetails(true);
                            }}
                            className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                          >
                            <Info size={10} className="sm:w-3 sm:h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => slideRight("slider-1", 150)}
                  className="absolute right-1 sm:right-2 p-1.5 sm:p-2 rounded-full bg-white shadow-md text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all z-10"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Objective Section */}
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="objective" className="text-sm font-medium">
                  Interview Objective
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" className="p-0 h-auto ml-2">
                      <HelpCircle size={14} className="text-gray-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[200px] text-xs">Describe the purpose and goals of this interview</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Textarea
                id="objective"
                value={objective}
                className="h-20 sm:h-24 resize-none border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm sm:text-base"
                placeholder="e.g. Assess candidates based on their technical skills, problem-solving abilities, and experience with React."
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setObjective(e.target.value)}
                onBlur={(e: ChangeEvent<HTMLTextAreaElement>) => setObjective(e.target.value.trim())}
              />
            </div>

            {/* Document Upload Section */}
            <div className="space-y-2 bg-gray-50 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center">
                <Label className="text-sm font-medium">
                  Supporting Documents
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" className="p-0 h-auto ml-2">
                      <HelpCircle size={14} className="text-gray-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[200px] text-xs">Upload job descriptions, requirements, or any reference documents that will help create better questions</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="overflow-hidden">
                <FileUpload
                  isUploaded={isUploaded}
                  setIsUploaded={setIsUploaded}
                  fileName={fileName}
                  setFileName={setFileName}
                  setUploadedDocumentContext={setUploadedDocumentContext}
                />
              </div>
            </div>

            {/* Interview Settings Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 bg-gray-50 p-3 sm:p-4 rounded-lg">
              {/* Anonymous Responses */}
              <div className="space-y-2">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Label htmlFor="anonymousSwitch" className="text-sm font-medium cursor-pointer">
                        Anonymous Responses
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" className="p-0 h-auto ml-2">
                            <HelpCircle size={14} className="text-gray-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-[200px] text-xs">When enabled, interviewee names and emails won't be collected</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch
                      id="anonymousSwitch"
                      checked={isAnonymous}
                      className={`${isAnonymous ? "bg-indigo-600" : "bg-gray-200"}`}
                      onCheckedChange={(checked) => setIsAnonymous(checked)}
                    />
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-500 italic">
                    If disabled, interviewee&apos;s email and name will be collected
                  </p>
                </div>
              </div>

              {/* Question Count */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="questionCount" className="text-sm font-medium">
                    Number of Questions
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" className="p-0 h-auto ml-2">
                        <HelpCircle size={14} className="text-gray-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">Maximum of 5 questions allowed</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="questionCount"
                  type="number"
                  min="1"
                  max="5"
                  className="w-full border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm sm:text-base"
                  value={numQuestions}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    let value = e.target.value;
                    if (
                      value === "" ||
                      (Number.isInteger(Number(value)) && Number(value) > 0)
                    ) {
                      if (Number(value) > 5) {
                        value = "5";
                      }
                      setNumQuestions(value);
                    }
                  }}
                />
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="duration" className="text-sm font-medium">
                    Duration (minutes)
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" className="p-0 h-auto ml-2">
                        <HelpCircle size={14} className="text-gray-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">Maximum of 10 minutes allowed</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="10"
                    className="pl-10 w-full border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm sm:text-base"
                    value={duration}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      let value = e.target.value;
                      if (
                        value === "" ||
                        (Number.isInteger(Number(value)) && Number(value) > 0)
                      ) {
                        if (Number(value) > 10) {
                          value = "10";
                        }
                        setDuration(value);
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 mb-2 sm:mb-4">
              <Button
                disabled={!isFormValid || isClicked}
                className={`${
                  isFormValid && !isClicked
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-gray-300"
                } text-white py-2 px-4 sm:px-6 rounded-lg transition-all shadow-md flex-1 max-w-none sm:max-w-xs text-sm sm:text-base`}
                onClick={() => {
                  setIsClicked(true);
                  onGenrateQuestions();
                }}
              >
                Generate Questions
              </Button>
              <Button
                disabled={!isFormValid || isClicked}
                className={`${
                  isFormValid && !isClicked
                    ? "bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50"
                    : "bg-gray-100 text-gray-400 border border-gray-300"
                } py-2 px-4 sm:px-6 rounded-lg transition-all shadow-sm flex-1 max-w-none sm:max-w-xs text-sm sm:text-base`}
                onClick={() => {
                  setIsClicked(true);
                  onManual();
                }}
              >
                I&apos;ll do it myself
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Modal
        open={openInterviewerDetails}
        closeOnOutsideClick={true}
        onClose={() => {
          setOpenInterviewerDetails(false);
        }}
      >
        <InterviewerDetailsModal interviewer={interviewerDetails} />
      </Modal>
    </TooltipProvider>
  );
}

export default DetailsPopup;
