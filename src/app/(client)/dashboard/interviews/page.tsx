"use client";

import { useInterviews } from "@/contexts/interviews.context";
import React from "react";
import InterviewCard from "@/components/dashboard/interview/interviewCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

function Interviews() {
  const { interviews } = useInterviews();

  return (
    <main className="container max-w-[1400px] px-4 sm:px-6 py-8">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Interviews</h1>
            <p className="text-sm text-slate-600 mt-1">
              Get to know them by clicking on their profile.
            </p>
          </div>
          <Button className="bg-[#02563D] hover:bg-[#02563D]/90 text-white font-medium" asChild>
            <Link href="/create-interview">
              <Plus className="h-4 w-4 mr-1.5" />
              Add Interview
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {interviews.map((interview) => (
            <InterviewCard
              key={interview.id}
              {...interview}
              interviewerId={interview.interviewer_id ? BigInt(interview.interviewer_id) : BigInt(0)}
              url={interview.url || ''}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export default Interviews; 
