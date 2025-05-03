"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useClerk, useOrganization } from "@clerk/nextjs";
import { InterviewBase, Question } from "@/types/interview";
import { useInterviews } from "@/contexts/interviews.context";
import { ScrollArea } from "@/components/ui/scroll-area";
import QuestionCard from "@/components/dashboard/interview/create-popup/questionCard";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, Loader2 } from "lucide-react";

interface Props {
  interviewData: InterviewBase;
  setProceed: (proceed: boolean) => void;
  setOpen: (open: boolean) => void;
}

export default function QuestionsPopup({ interviewData, setProceed, setOpen }: Props) {
  const { user } = useClerk();
  const { organization } = useOrganization();
  const [isClicked, setIsClicked] = useState(false);

  const [questions, setQuestions] = useState<Question[]>(
    interviewData.questions,
  );
  const [description, setDescription] = useState<string>(
    interviewData.description.trim(),
  );
  const { fetchInterviews } = useInterviews();

  const endOfListRef = useRef<HTMLDivElement>(null);
  const prevQuestionLengthRef = useRef(questions.length);

  const handleInputChange = (id: string, newQuestion: Question) => {
    setQuestions(
      questions.map((question) =>
        question.id === id ? { ...question, ...newQuestion } : question,
      ),
    );
  };

  const handleDeleteQuestion = (id: string) => {
    if (questions.length === 1) {
      setQuestions(
        questions.map((question) => ({
          ...question,
          question: "",
          follow_up_count: 1,
        })),
      );

      return;
    }
    setQuestions(questions.filter((question) => question.id !== id));
  };

  const handleAddQuestion = () => {
    if (questions.length < interviewData.question_count) {
      setQuestions([
        ...questions,
        { id: uuidv4(), question: "", follow_up_count: 1 },
      ]);
    }
  };

  const onSave = async () => {
    try {
      interviewData.user_id = user?.id || "";
      interviewData.organization_id = organization?.id || "";

      interviewData.questions = questions;
      interviewData.description = description;

      // Convert BigInts to strings if necessary
      const sanitizedInterviewData = {
        ...interviewData,
        interviewer_id: interviewData.interviewer_id.toString(),
        response_count: interviewData.response_count.toString(),
        logo_url: organization?.imageUrl || "",
      };

      const response = await axios.post("/api/create-interview", {
        organizationName: organization?.name,
        interviewData: sanitizedInterviewData,
      });
      setIsClicked(false);
      fetchInterviews();
      setOpen(false);
    } catch (error) {
      console.error("Error creating interview:", error);
    }
  };

  useEffect(() => {
    if (questions.length > prevQuestionLengthRef.current) {
      endOfListRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevQuestionLengthRef.current = questions.length;
  }, [questions.length]);

  return (
    <div className="bg-black/90 backdrop-blur-md rounded-xl border border-[#02563D]/30 p-4">
      <div className={`text-center px-1 flex flex-col justify-top items-center w-full ${
        interviewData.question_count > 1 ? "h-[29rem]" : ""
      }`}>
        <div className="relative flex justify-center w-full mb-6">
          <ChevronLeft
            className="absolute left-0 opacity-50 cursor-pointer hover:opacity-100 text-neutral-400 hover:text-white transition-colors"
            size={30}
            onClick={() => setProceed(false)}
          />
          <h2 className="text-2xl font-bold text-white">Create Interview</h2>
        </div>
        
        <div className="my-3 text-left w-[96%] text-sm text-neutral-400">
          We will be using these questions during the interviews. Please make sure they are ok.
        </div>

        <ScrollArea className="flex flex-col justify-center items-center w-full mt-3">
          {questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              questionNumber={index + 1}
              questionData={question}
              onDelete={handleDeleteQuestion}
              onQuestionChange={handleInputChange}
            />
          ))}
          <div ref={endOfListRef} />
        </ScrollArea>

        {questions.length < interviewData.question_count && (
          <div
            className="border-2 border-[#02563D] rounded-full p-1 opacity-75 hover:opacity-100 transition-all duration-300
              hover:shadow-lg hover:shadow-[#02563D]/20"
            onClick={handleAddQuestion}
          >
            <Plus
              size={40}
              strokeWidth={2}
              className="text-emerald-400 cursor-pointer"
            />
          </div>
        )}
      </div>

      <div className="space-y-2 mt-6">
        <label className="text-sm font-medium text-neutral-200">
          Interview Description
          <span className="text-xs text-neutral-400 italic block mt-1">
            Note: Interviewees will see this description.
          </span>
        </label>
        <textarea
          value={description}
          className="w-full h-24 resize-none rounded-lg bg-black/40 border border-neutral-800 text-white 
            placeholder:text-neutral-500 focus:border-[#02563D] focus:ring-[#02563D]/20 transition-all duration-300 p-3"
          placeholder="Enter your interview description."
          onChange={(e) => setDescription(e.target.value)}
          onBlur={(e) => setDescription(e.target.value.trim())}
        />
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button
          variant="outline"
          onClick={() => setProceed(false)}
          className="bg-black/40 text-neutral-300 border-neutral-800 
            hover:bg-[#02563D]/20 hover:text-white transition-all duration-300"
        >
          Back
        </Button>
        <Button
          disabled={
            isClicked ||
            questions.length < interviewData.question_count ||
            questions.some((q) => !q.question.trim()) ||
            !description.trim()
          }
          className={`${
            !isClicked &&
            questions.length === interviewData.question_count &&
            !questions.some((q) => !q.question.trim()) &&
            description.trim()
              ? "bg-[#02563D] hover:bg-emerald-700 shadow-lg shadow-[#02563D]/20 hover:shadow-[#02563D]/40"
              : "bg-neutral-800"
          } text-white transition-all duration-300 disabled:opacity-50`}
          onClick={() => {
            setIsClicked(true);
            onSave();
          }}
        >
          {isClicked ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Interview'
          )}
        </Button>
      </div>
    </div>
  );
}
