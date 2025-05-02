import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Info, Upload, BarChart3, Clock, UserCircle, ClipboardList, SmileIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Interviewer {
  id: string;
  initials: string;
  name: string;
  role: string;
  bgColor: string;
  textColor: string;
}

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface InterviewSummary {
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number;
  totalDuration: number;
  recentCandidates: {
    name: string;
    score: number;
    status: string;
  }[];
  skillBreakdown: {
    technical: number;
    communication: number;
    problemSolving: number;
    behavioral: number;
  };
}

interface InterviewAnalysis {
  name: string;
  overallScore: number;
  communicationScore: number;
  summary: string;
  averageDuration: string;
  completionRate: number;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  status: {
    selected: number;
    potential: number;
    notSelected: number;
    noStatus: number;
  };
  totalResponses: number;
}

export default function CreateInterviewModal({ open, setOpen }: Props) {
  const [numQuestions, setNumQuestions] = useState("10");
  const [duration, setDuration] = useState("30");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedInterviewer, setSelectedInterviewer] = useState<string | null>(null);
  const [interviewName, setInterviewName] = useState("");
  const [objective, setObjective] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [selectedInterviewerSummary, setSelectedInterviewerSummary] = useState<InterviewSummary | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [selectedInterviewerAnalysis, setSelectedInterviewerAnalysis] = useState<InterviewAnalysis | null>(null);

  const mockSummary: InterviewSummary = {
    totalInterviews: 48,
    completedInterviews: 42,
    averageScore: 78,
    totalDuration: 2520, // in minutes
    recentCandidates: [
      { name: "John Doe", score: 85, status: "Selected" },
      { name: "Jane Smith", score: 72, status: "In Review" },
      { name: "Mike Johnson", score: 68, status: "Not Selected" }
    ],
    skillBreakdown: {
      technical: 82,
      communication: 75,
      problemSolving: 80,
      behavioral: 85
    }
  };

  const mockAnalysis: InterviewAnalysis = {
    name: "SHailendra Malviya",
    overallScore: 40,
    communicationScore: 4,
    summary: "Demonstrated basic communication with limited critical thinking and adaptability under interview pressure.",
    averageDuration: "1m 18s",
    completionRate: 0,
    sentiment: {
      positive: 0,
      neutral: 1,
      negative: 0
    },
    status: {
      selected: 0,
      potential: 0,
      notSelected: 0,
      noStatus: 1
    },
    totalResponses: 1
  };

  const handleCardClick = (interviewer: Interviewer) => {
    setSelectedInterviewer(interviewer.id);
    setSelectedInterviewerAnalysis(mockAnalysis);
    setShowAnalysis(true);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const SummaryModal = () => (
    <Dialog open={showSummary} onOpenChange={setShowSummary}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#02563D]" />
            Interview Summary
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Overview Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-[#E5EFEB] rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <UserCircle className="h-4 w-4 text-[#02563D]" />
                <h3 className="font-medium text-[#02563D]">Total Interviews</h3>
              </div>
              <p className="text-2xl font-bold text-[#02563D]">{selectedInterviewerSummary?.totalInterviews}</p>
            </div>
            <div className="p-4 bg-[#E5EFEB] rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ClipboardList className="h-4 w-4 text-[#02563D]" />
                <h3 className="font-medium text-[#02563D]">Completed</h3>
              </div>
              <p className="text-2xl font-bold text-[#02563D]">{selectedInterviewerSummary?.completedInterviews}</p>
            </div>
            <div className="p-4 bg-[#E5EFEB] rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-[#02563D]" />
                <h3 className="font-medium text-[#02563D]">Avg. Score</h3>
              </div>
              <p className="text-2xl font-bold text-[#02563D]">{selectedInterviewerSummary?.averageScore}%</p>
            </div>
            <div className="p-4 bg-[#E5EFEB] rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-[#02563D]" />
                <h3 className="font-medium text-[#02563D]">Total Duration</h3>
              </div>
              <p className="text-2xl font-bold text-[#02563D]">{formatDuration(selectedInterviewerSummary?.totalDuration || 0)}</p>
            </div>
          </div>

          {/* Skill Breakdown */}
          <div>
            <h3 className="font-medium text-slate-900 mb-3">Skill Assessment Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(selectedInterviewerSummary?.skillBreakdown || {}).map(([skill, score]) => (
                <div key={skill} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-700 w-32 capitalize">{skill}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#02563D] rounded-full"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{score}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Candidates */}
          <div>
            <h3 className="font-medium text-slate-900 mb-3">Recent Candidates</h3>
            <div className="space-y-2">
              {selectedInterviewerSummary?.recentCandidates.map((candidate, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-900">{candidate.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-600">{candidate.score}%</span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      candidate.status === 'Selected' ? 'bg-green-100 text-green-700' :
                      candidate.status === 'Not Selected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {candidate.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const AnalysisModal = () => (
    <Dialog open={showAnalysis} onOpenChange={setShowAnalysis}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Overall Analysis</DialogTitle>
          <p className="text-sm text-slate-600 mt-2">
            Interview Description: This interview explores your UI/UX technical expertise, problem-solving skills, and project experience, focusing on tackling design challenges and creating user-centered solutions.
          </p>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Main Analysis Table */}
          <div className="bg-white rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-900">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-900">Overall Score</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-900">Communication Score</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-900">Summary</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3 text-sm text-slate-900">{selectedInterviewerAnalysis?.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-900">{selectedInterviewerAnalysis?.overallScore}</td>
                  <td className="px-4 py-3 text-sm text-slate-900">{selectedInterviewerAnalysis?.communicationScore}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{selectedInterviewerAnalysis?.summary}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-4">
            {/* Average Duration */}
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-900">Average Duration</h3>
                <Info className="h-4 w-4 text-slate-400" />
              </div>
              <p className="text-2xl font-semibold text-indigo-600">{selectedInterviewerAnalysis?.averageDuration}</p>
            </div>

            {/* Candidate Sentiment */}
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-900">Candidate Sentiment</h3>
                <Info className="h-4 w-4 text-slate-400" />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-600">Positive ({selectedInterviewerAnalysis?.sentiment.positive})</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-slate-600">Neutral ({selectedInterviewerAnalysis?.sentiment.neutral})</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-slate-600">Negative ({selectedInterviewerAnalysis?.sentiment.negative})</span>
                </div>
              </div>
            </div>

            {/* Candidate Status */}
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-900">Candidate Status</h3>
                <Info className="h-4 w-4 text-slate-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Selected</span>
                  <span className="text-sm font-medium text-slate-900">{selectedInterviewerAnalysis?.status.selected}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Potential</span>
                  <span className="text-sm font-medium text-slate-900">{selectedInterviewerAnalysis?.status.potential}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Not Selected</span>
                  <span className="text-sm font-medium text-slate-900">{selectedInterviewerAnalysis?.status.notSelected}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">No Status</span>
                  <span className="text-sm font-medium text-slate-900">{selectedInterviewerAnalysis?.status.noStatus}</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">Total Responses</span>
                  <span className="text-sm font-medium text-slate-900">{selectedInterviewerAnalysis?.totalResponses}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const interviewers: Interviewer[] = [
    {
      id: "1",
      initials: "TL",
      name: "Technical Lead Sarah",
      role: "Technical Lead",
      bgColor: "bg-emerald-100",
      textColor: "text-emerald-700"
    },
    {
      id: "2",
      initials: "HM",
      name: "HR Manager Michael",
      role: "HR Manager",
      bgColor: "bg-amber-100",
      textColor: "text-amber-700"
    },
    {
      id: "3",
      initials: "DD",
      name: "Design Director Emma",
      role: "Design Director",
      bgColor: "bg-amber-100",
      textColor: "text-amber-700"
    }
  ];

  const handleNext = () => {
    // Handle next step logic here
    console.log({
      interviewName,
      selectedInterviewer,
      numQuestions,
      duration,
      isAnonymous
    });
  };

  const isNextDisabled = !interviewName || !selectedInterviewer;

  return (
    <div className="w-full max-w-sm px-4">
      <div className="space-y-4">
        <div className="mb-4 text-center">
          <h2 className="text-xl font-semibold text-slate-900">Create an Interview</h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Interview Name
          </label>
          <Input 
            placeholder="e.g. Senior Frontend Developer Interview"
            className="w-full"
            value={interviewName}
            onChange={(e) => setInterviewName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Select an Interviewer
          </label>
          <div className="flex gap-4 overflow-x-auto py-2 justify-center">
            {interviewers.map((interviewer) => (
              <div
                key={interviewer.id}
                className={`flex flex-col items-center gap-1 min-w-[90px] cursor-pointer transition-all hover:scale-105 ${
                  selectedInterviewer === interviewer.id ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                }`}
                onClick={() => {
                  handleCardClick(interviewer);
                }}
              >
                <div className={`w-12 h-12 rounded-full ${interviewer.bgColor} flex items-center justify-center ${interviewer.textColor} font-medium ${
                  selectedInterviewer === interviewer.id ? 'ring-2 ring-primary ring-offset-2' : ''
                }`}>
                  {interviewer.initials}
                </div>
                <span className="text-sm text-slate-900 text-center">{interviewer.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <label className="block text-sm font-medium text-slate-700">
              Objective
            </label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Define the main goal of this interview</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Textarea 
            placeholder="e.g. Evaluate technical skills and problem-solving abilities"
            className="w-full"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <label className="block text-sm font-medium text-slate-700">
              Upload Documents (Optional)
            </label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upload any supporting documents for the interview</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-6 w-6 text-slate-400" />
              <p className="text-sm text-slate-600">
                Drop your files here or <span className="text-primary cursor-pointer">browse</span>
              </p>
              <p className="text-xs text-slate-500">Supports: PDF, DOC, DOCX (Max 10MB)</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Anonymous Responses</label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Hide candidate information in responses</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Switch
            checked={isAnonymous}
            onCheckedChange={setIsAnonymous}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Number of Questions
            </label>
            <Input
              type="number"
              value={numQuestions}
              onChange={(e) => setNumQuestions(e.target.value)}
              min="1"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Duration (mins)
            </label>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="1"
              className="w-full"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button 
            className="flex-1 bg-[#02563D] hover:bg-[#02563D]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleNext}
            disabled={isNextDisabled}
          >
            Next: Generate Questions
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleNext}
            disabled={isNextDisabled}
          >
            I'll do it myself
          </Button>
        </div>
      </div>
      <SummaryModal />
      <AnalysisModal />
    </div>
  );
}
