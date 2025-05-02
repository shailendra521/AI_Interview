"use client";

import { useInterviewers } from "@/contexts/interviewers.context";
import React from "react";
import InterviewerCard from "@/components/dashboard/interviewer/interviewerCard";
import CreateInterviewerButton from "@/components/dashboard/interviewer/createInterviewerButton";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Plus } from "lucide-react";

function Interviewers() {
  const { interviewers, interviewersLoading } = useInterviewers();

  function InterviewersLoader() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="h-32 w-full">
              <Skeleton className="h-full w-full rounded-none" />
            </div>
            <CardContent className="p-4 flex flex-col items-center space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  function EmptyState() {
    return (
      <Card className="w-full p-12 text-center border-dashed border-2 bg-slate-50/50 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="bg-primary/10 p-4 rounded-xl">
            <Users className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-900">No AI agents yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Create your first AI agent to get started with conducting automated interviews.
            </p>
          </div>
          <div className="pt-6">
            <CreateInterviewerButton />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <main className="container max-w-[1400px] py-12">
      <div className="space-y-10">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2.5 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-3xl font-semibold tracking-tight">Interviewers</h2>
            </div>
            <p className="text-base text-muted-foreground">
              Get to know them by clicking on their profile.
            </p>
          </div>
          {interviewers.length > 0 && (
            <div className="hidden sm:block">
              <CreateInterviewerButton />
            </div>
          )}
        </div>

        {interviewersLoading ? (
          <InterviewersLoader />
        ) : interviewers.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="px-1">
            <Carousel 
              opts={{ 
                align: "start"
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-6">
                {interviewers.map((interviewer) => (
                  <CarouselItem key={interviewer.id} className="pl-6 md:basis-1/2 lg:basis-1/3">
                    <InterviewerCard interviewer={interviewer} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        )}
      </div>
    </main>
  );
}

export default Interviewers;
