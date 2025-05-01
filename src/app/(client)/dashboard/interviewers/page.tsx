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
      <Card className="w-full p-8 text-center border-dashed border-2 bg-slate-50">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-medium">No interviewers yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Create your first interviewer to get started with conducting interviews.
            </p>
          </div>
          <div className="pt-4">
            <CreateInterviewerButton />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <main className="container py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold tracking-tight">Interviewers</h2>
            </div>
            <p className="text-sm text-muted-foreground">
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
          <Carousel 
            opts={{ align: "start" }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {interviewers.map((interviewer) => (
                <CarouselItem key={interviewer.id} className="pl-4 md:basis-1/3 lg:basis-1/4">
                  <InterviewerCard interviewer={interviewer} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden sm:block">
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </div>
          </Carousel>
        )}
      </div>
    </main>
  );
}

export default Interviewers;
