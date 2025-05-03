import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useClerk, useOrganization } from "@clerk/nextjs";
import { InterviewBase, Question } from "@/types/interview";
import { useInterviews } from "@/contexts/interviews.context";
import { ScrollArea } from "@/components/ui/scroll-area";
import QuestionCard from "@/components/dashboard/interview/create-popup/questionCard";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, Save, CheckCircle } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface Props {
  interviewData: InterviewBase;
  setProceed: (proceed: boolean) => void;
  setOpen: (open: boolean) => void;
}

function QuestionsPopup({ interviewData, setProceed, setOpen }: Props) {
  const { user } = useClerk();
  const { organization } = useOrganization();
  const [isClicked, setIsClicked] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

      await axios.post("/api/create-interview", {
        organizationName: organization?.name,
        interviewData: sanitizedInterviewData,
      });
      
      setShowSuccess(true);
      fetchInterviews();
      
      // Close after showing success for 2 seconds
      setTimeout(() => {
        setIsClicked(false);
        setOpen(false);
      }, 2000);
      
    } catch (error) {
      console.error("Error creating interview:", error);
      toast.error("Failed to create interview. Please try again.");
      setIsClicked(false);
    }
  };

  useEffect(() => {
    if (questions.length > prevQuestionLengthRef.current) {
      endOfListRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevQuestionLengthRef.current = questions.length;
  }, [questions.length]);

  return (
    <TooltipProvider>
      {showSuccess ? (
        <div className="w-[95vw] sm:w-full max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Interview Created Successfully!</h2>
            <p className="text-gray-600">Your interview has been set up and is ready to use.</p>
          </div>
        </div>
      ) : (
        <div className="w-[95vw] sm:w-full max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="sticky top-0 z-10 bg-white px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
            <button
              onClick={() => setProceed(false)}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
            </button>
            <h1 className="text-lg sm:text-2xl font-semibold text-center text-gray-800 px-6 sm:px-8 truncate">Create Interview</h1>
          </div>

          <div className="p-3 sm:p-6">
            <div className="bg-blue-50 rounded-lg p-2.5 sm:p-4 mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm text-blue-700">
                We will be using these questions during the interviews. Please make sure they are ok.
              </p>
            </div>

            <ScrollArea className="pr-2 sm:pr-4 max-h-[45vh] sm:max-h-[50vh] md:max-h-[60vh] overflow-y-auto">
              <div className="space-y-3 sm:space-y-4 min-h-[200px]">
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
              </div>
            </ScrollArea>

            {questions.length < interviewData.question_count && (
              <div className="flex justify-center mt-3 sm:mt-4">
                <button
                  onClick={handleAddQuestion}
                  className="p-1.5 sm:p-2 rounded-full hover:bg-indigo-50 text-indigo-600 transition-colors group"
                >
                  <Plus
                    size={28}
                    className="transition-transform group-hover:scale-110 sm:w-8 sm:h-8"
                  />
                </button>
              </div>
            )}

            <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                <h2 className="text-sm sm:text-lg font-semibold text-gray-800">Interview Description</h2>
                <span className="text-[10px] sm:text-xs text-gray-500 italic">
                  Note: Interviewees will see this description.
                </span>
              </div>
              <textarea
                value={description}
                className="w-full h-20 sm:h-32 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none text-xs sm:text-base"
                placeholder="Enter your interview description..."
                onChange={(e) => setDescription(e.target.value)}
                onBlur={(e) => setDescription(e.target.value.trim())}
              />
            </div>

            <div className="mt-4 sm:mt-6 flex justify-end">
              <Button
                disabled={
                  isClicked ||
                  questions.length < interviewData.question_count ||
                  description.trim() === "" ||
                  questions.some((question) => question.question.trim() === "")
                }
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-6 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2 disabled:bg-gray-300 text-sm sm:text-base"
                onClick={() => {
                  setIsClicked(true);
                  onSave();
                }}
              >
                <Save size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span>Save Interview</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </TooltipProvider>
  );
}

export default QuestionsPopup;
