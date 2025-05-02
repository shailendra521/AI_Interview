import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Filter,
  Share,
  Eye,
  Edit,
  MessageSquare,
  Calendar,
  Clock,
  ChevronDown,
  Info
} from 'lucide-react';
import { Switch } from "@/components/ui/switch";

interface ResponseDetails {
  name: string;
  overallScore: number;
  communicationScore: number;
  summary: string;
}

interface Props {
  candidateName: string;
  interviewDescription: string;
  responseDetails: ResponseDetails[];
  interviewer: string;
}

export default function InterviewAnalysis({ 
  candidateName, 
  interviewDescription,
  responseDetails,
  interviewer
}: Props) {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">{candidateName}</h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-sm text-slate-600">1</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            <Share className="h-4 w-4 mr-1" />
            Share
          </Button>
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button variant="ghost" size="sm">
            <MessageSquare className="h-4 w-4 mr-1" />
            Notes
          </Button>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Active</span>
            <Switch />
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="mb-6">
        <Button variant="outline" size="sm" className="text-slate-600">
          <Filter className="h-4 w-4 mr-2" />
          Filter By
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Overall Analysis */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            Overall Analysis
            <span className="text-sm font-normal text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Interviewer: {interviewer}
            </span>
          </h2>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg mb-6">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-slate-400" />
            <p className="text-sm text-slate-600">
              Interview Description: {interviewDescription}
            </p>
          </div>
        </div>

        {/* Response Details */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-medium">Response Details</h3>
          </div>
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-500">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-500">
                  Overall Score
                  <ChevronDown className="h-4 w-4 inline ml-1" />
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-500">
                  Communication Score
                  <ChevronDown className="h-4 w-4 inline ml-1" />
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-500">Summary</th>
              </tr>
            </thead>
            <tbody>
              {responseDetails.map((response, index) => (
                <tr key={index} className="border-t border-slate-200">
                  <td className="px-6 py-4 text-sm text-slate-900">{response.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-900">{response.overallScore}</td>
                  <td className="px-6 py-4 text-sm text-slate-900">{response.communicationScore}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-xl">{response.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Key Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Average Duration</span>
                <Info className="h-4 w-4 text-slate-400" />
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="text-xl font-semibold">1m 18s</span>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Completion Rate</span>
                <Info className="h-4 w-4 text-slate-400" />
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="text-xl font-semibold">100%</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Candidate Sentiment</h3>
            <Info className="h-4 w-4 text-slate-400" />
          </div>
          <div className="relative h-40">
            {/* This is where we'd add the sentiment chart */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-semibold">Positive</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 
