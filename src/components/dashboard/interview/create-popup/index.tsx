"use client";

import React, { useState } from "react";
import { InterviewBase } from "@/types/interview";
import DetailsPopup from "./details";
import QuestionsPopup from "./questions";

interface Props {
  setOpen: (open: boolean) => void;
}

export default function CreatePopup({ setOpen }: Props) {
  const [loading, setLoading] = useState(false);
  const [proceed, setProceed] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const [interviewData, setInterviewData] = useState<InterviewBase>({
    id: BigInt(0),
    name: "",
    objective: "",
    description: "",
    interviewer_id: BigInt(0),
    user_id: "",
    organization_id: "",
    questions: [],
    question_count: 0,
    time_duration: "",
    response_count: BigInt(0),
    is_anonymous: false,
    created_at: new Date(),
  });

  if (loading && !proceed) {
    return (
      <DetailsPopup
        open={true}
        setLoading={setLoading}
        interviewData={interviewData}
        setInterviewData={setInterviewData}
        isUploaded={isUploaded}
        setIsUploaded={setIsUploaded}
        fileName={fileName}
        setFileName={setFileName}
      />
    );
  }

  if (loading && proceed) {
    return (
      <QuestionsPopup
        interviewData={interviewData}
        setProceed={setProceed}
        setOpen={setOpen}
      />
    );
  }

  return (
    <DetailsPopup
      open={true}
      setLoading={setLoading}
      interviewData={interviewData}
      setInterviewData={setInterviewData}
      isUploaded={isUploaded}
      setIsUploaded={setIsUploaded}
      fileName={fileName}
      setFileName={setFileName}
    />
  );
} 
