"use client";

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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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

export default function DetailsPopup({
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
  const [selectedInterviewer, setSelectedInterviewer] = useState<string>(
    interviewData.interviewer_id ? interviewData.interviewer_id.toString() : ""
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

  const handleInterviewerSelect = (interviewer: Interviewer) => {
    console.log('Selecting interviewer:', interviewer.name, interviewer.id.toString());
    setSelectedInterviewer(interviewer.id.toString());
    setInterviewerDetails(interviewer);
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
      interviewer_id: BigInt(selectedInterviewer),
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
      interviewer_id: BigInt(selectedInterviewer),
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
    selectedInterviewer !== "";

  useEffect(() => {
    if (!open) {
      setName("");
      setSelectedInterviewer("");
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

  useEffect(() => {
    console.log('Selected Interviewer:', selectedInterviewer);
  }, [selectedInterviewer]);

  return (
    <TooltipProvider>
      <div className="bg-black/90 backdrop-blur-md rounded-xl border border-[#02563D]/30 shadow-lg p-4 w-full max-w-xl overflow-hidden">
        <div className="max-h-[80vh] overflow-y-auto pr-2">
          <h1 className="text-2xl font-bold text-center mb-6 text-white">Create an Interview</h1>
          
          <div className="space-y-6">
            {/* Interview Name Section */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-neutral-200">
                Interview Name
              </Label>
              <Input
                id="name"
                value={name}
                className="bg-black/40 border-neutral-800 text-white placeholder:text-neutral-500
                  focus:border-[#02563D] focus:ring-[#02563D]/20 transition-all duration-300"
                placeholder="e.g. Frontend Developer Interview"
                onChange={(e) => setName(e.target.value)}
                onBlur={(e) => setName(e.target.value.trim())}
              />
            </div>

            {/* Interviewer Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-neutral-200">
                  Select an Interviewer
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" className="p-0 h-auto ml-2">
                      <HelpCircle size={16} className="text-neutral-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-black/90 border-[#02563D]/30 text-white">
                    <p className="w-[200px] text-xs">Choose who will conduct this interview</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              <div className="relative">
                <div id="slider-3" className="flex items-center gap-4 overflow-x-auto py-2 pr-2">
                  {interviewers.map((interviewer) => (
                    <button
                      key={interviewer.id.toString()}
                      type="button"
                      onClick={() => handleInterviewerSelect(interviewer)}
                      className={`flex flex-col items-center p-2 rounded-lg transition-all duration-300 hover:scale-105 focus:outline-none ${
                        selectedInterviewer === interviewer.id.toString()
                          ? "scale-105 ring-2 ring-[#02563D] bg-[#02563D]/10"
                          : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Avatar className="w-16 h-16 border-2 border-[#02563D]/30">
                        <AvatarImage src={interviewer.image} alt={interviewer.name} />
                        <AvatarFallback className="bg-[#02563D]/20 text-emerald-300">
                          {interviewer.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-xs text-center mt-2 text-neutral-300 font-medium">
                        {interviewer.name}
                      </p>
                    </button>
                  ))}
                </div>
                {interviewers.length > 3 && (
                  <div className="absolute top-1/2 -translate-y-1/2 flex justify-between w-full">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full w-8 h-8 p-0 bg-black/60 border-[#02563D]/30 text-neutral-300
                        hover:bg-[#02563D]/20 hover:text-white transition-all duration-300"
                      onClick={() => slideLeft("slider-3", 115)}
                    >
                      <ChevronLeft size={18} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full w-8 h-8 p-0 bg-black/60 border-[#02563D]/30 text-neutral-300
                        hover:bg-[#02563D]/20 hover:text-white transition-all duration-300"
                      onClick={() => slideRight("slider-3", 115)}
                    >
                      <ChevronRight size={18} />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Objective Section */}
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="objective" className="text-sm font-medium text-neutral-200">
                  Interview Objective
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" className="p-0 h-auto ml-2">
                      <HelpCircle size={16} className="text-neutral-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-black/90 border-[#02563D]/30 text-white">
                    <p className="w-[200px] text-xs">Describe the purpose and goals of this interview</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Textarea
                id="objective"
                value={objective}
                className="bg-black/40 border-neutral-800 text-white placeholder:text-neutral-500
                  focus:border-[#02563D] focus:ring-[#02563D]/20 transition-all duration-300 h-24 resize-none"
                placeholder="e.g. Assess candidates based on their technical skills, problem-solving abilities, and experience with React."
                onChange={(e) => setObjective(e.target.value)}
                onBlur={(e) => setObjective(e.target.value.trim())}
              />
            </div>

            {/* Document Upload Section */}
            <div className="space-y-2">
              <div className="flex items-center">
                <Label className="text-sm font-medium text-neutral-200">
                  Supporting Documents
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" className="p-0 h-auto ml-2">
                      <HelpCircle size={16} className="text-neutral-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-black/90 border-[#02563D]/30 text-white">
                    <p className="w-[200px] text-xs">Upload job descriptions, requirements, or any reference documents</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/40 border border-[#02563D]/20 p-4 rounded-lg">
              {/* Anonymous Responses */}
              <div className="space-y-2">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Label htmlFor="anonymousSwitch" className="text-sm font-medium text-neutral-200 cursor-pointer">
                        Anonymous Responses
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" className="p-0 h-auto ml-2">
                            <HelpCircle size={16} className="text-neutral-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black/90 border-[#02563D]/30 text-white">
                          <p className="w-[200px] text-xs">When enabled, interviewee names and emails won't be collected</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch
                      id="anonymousSwitch"
                      checked={isAnonymous}
                      onCheckedChange={setIsAnonymous}
                      className={`${isAnonymous ? "bg-[#02563D]" : "bg-neutral-700"}`}
                    />
                  </div>
                  <p className="text-xs text-neutral-400 italic">
                    If disabled, interviewee&apos;s email and name will be collected
                  </p>
                </div>
              </div>

              {/* Question Count */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="questionCount" className="text-sm font-medium text-neutral-200">
                    Number of Questions
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" className="p-0 h-auto ml-2">
                        <HelpCircle size={16} className="text-neutral-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black/90 border-[#02563D]/30 text-white">
                      <p className="w-[200px] text-xs">Maximum of 5 questions allowed</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="questionCount"
                  type="number"
                  min="1"
                  max="5"
                  className="bg-black/40 border-neutral-800 text-white placeholder:text-neutral-500
                    focus:border-[#02563D] focus:ring-[#02563D]/20 transition-all duration-300"
                  value={numQuestions}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (value === "" || (Number.isInteger(Number(value)) && Number(value) > 0)) {
                      if (Number(value) > 5) value = "5";
                      setNumQuestions(value);
                    }
                  }}
                />
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="duration" className="text-sm font-medium text-neutral-200">
                    Duration (minutes)
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" className="p-0 h-auto ml-2">
                        <HelpCircle size={16} className="text-neutral-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black/90 border-[#02563D]/30 text-white">
                      <p className="w-[200px] text-xs">Recommended interview duration</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  className="bg-black/40 border-neutral-800 text-white placeholder:text-neutral-500
                    focus:border-[#02563D] focus:ring-[#02563D]/20 transition-all duration-300"
                  value={duration}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (value === "" || (Number.isInteger(Number(value)) && Number(value) > 0)) {
                      setDuration(value);
                    }
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 mb-4">
              <Button
                disabled={!isFormValid || isClicked}
                className={`${
                  isFormValid && !isClicked
                    ? "bg-[#02563D] hover:bg-emerald-700"
                    : "bg-neutral-800"
                } text-white py-2 px-6 rounded-lg transition-all duration-300 shadow-lg shadow-[#02563D]/20 
                hover:shadow-[#02563D]/40 flex-1 max-w-xs disabled:opacity-50`}
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
                    ? "bg-black/40 text-white border border-[#02563D] hover:bg-[#02563D]/20"
                    : "bg-neutral-900 text-neutral-400 border border-neutral-800"
                } py-2 px-6 rounded-lg transition-all duration-300 flex-1 max-w-xs disabled:opacity-50`}
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
        onClose={() => setOpenInterviewerDetails(false)}
      >
        <InterviewerDetailsModal interviewer={interviewerDetails} />
      </Modal>
    </TooltipProvider>
  );
}
