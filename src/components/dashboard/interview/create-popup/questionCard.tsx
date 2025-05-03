import { Question } from "@/types/interview";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuestionCardProps {
  questionNumber: number;
  questionData: Question;
  onQuestionChange: (id: string, question: Question) => void;
  onDelete: (id: string) => void;
}

const QuestionCard = ({
  questionNumber,
  questionData,
  onQuestionChange,
  onDelete,
}: QuestionCardProps) => {
  return (
    <TooltipProvider>
      <Card className="bg-white border border-gray-100 rounded-xl overflow-hidden transition-all hover:shadow-md">
        <CardContent className="p-3 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-indigo-100 text-indigo-600 font-semibold text-sm sm:text-base">
                {questionNumber}
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Question {questionNumber}</h3>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-sm font-medium text-gray-600">Depth:</span>
                <div className="flex gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className={`px-2 sm:px-3 py-1 sm:py-1.5 h-auto text-[10px] sm:text-xs font-medium rounded-full transition-all ${
                          questionData?.follow_up_count === 1
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        onClick={() =>
                          onQuestionChange(questionData.id, {
                            ...questionData,
                            follow_up_count: 1,
                          })
                        }
                      >
                        Low
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="text-xs">Brief follow-up</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className={`px-2 sm:px-3 py-1 sm:py-1.5 h-auto text-[10px] sm:text-xs font-medium rounded-full transition-all ${
                          questionData?.follow_up_count === 2
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        onClick={() =>
                          onQuestionChange(questionData.id, {
                            ...questionData,
                            follow_up_count: 2,
                          })
                        }
                      >
                        Medium
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="text-xs">Moderate follow-up</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className={`px-2 sm:px-3 py-1 sm:py-1.5 h-auto text-[10px] sm:text-xs font-medium rounded-full transition-all ${
                          questionData?.follow_up_count === 3
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        onClick={() =>
                          onQuestionChange(questionData.id, {
                            ...questionData,
                            follow_up_count: 3,
                          })
                        }
                      >
                        High
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="text-xs">In-depth follow-up</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onDelete(questionData.id)}
                    className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">Delete question</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="mt-3 sm:mt-4">
            <textarea
              value={questionData?.question}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none text-xs sm:text-base text-gray-700"
              placeholder="e.g. Can you tell me about a challenging project you've worked on?"
              rows={3}
              onChange={(e) =>
                onQuestionChange(questionData.id, {
                  ...questionData,
                  question: e.target.value,
                })
              }
            />
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default QuestionCard;
