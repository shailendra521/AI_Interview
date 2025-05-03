"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useOrganization } from "@clerk/nextjs";
import InterviewCard from "@/components/dashboard/interview/interviewCard";
import CreateInterviewCard from "@/components/dashboard/interview/createInterviewCard";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { InterviewService } from "@/services/interviews.service";
import { ClientService } from "@/services/clients.service";
import { ResponseService } from "@/services/responses.service";
import { InterviewerService } from "@/services/interviewers.service";
import { useInterviews } from "@/contexts/interviews.context";
import Modal from "@/components/dashboard/Modal";
import { ChevronRight, Gem, Plus, BarChart3, LayoutGrid, List, Users } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function Interviews() {
  const { interviews, interviewsLoading } = useInterviews();
  const { organization } = useOrganization();
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPlan, setCurrentPlan] = useState<string>("");
  const [allowedResponsesCount, setAllowedResponsesCount] = useState<number>(10);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [interviewers, setInterviewers] = useState<Record<string, any>>({});
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [totalResponses, setTotalResponses] = useState(0);

  function InterviewsLoader() {
    return (
      <div className="flex flex-row flex-wrap gap-4">
        {[1, 2, 3].map((index) => (
          <div key={index} className="w-64 h-64 rounded-xl bg-slate-100 animate-pulse shadow-sm" />
        ))}
      </div>
    );
  }

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        if (organization?.id) {
          const data = await ClientService.getOrganizationById(organization.id);
          if (data?.plan) {
            setCurrentPlan(data.plan);
            if (data.plan === "free_trial_over") {
              setIsModalOpen(true);
            }
          }
          if (data?.allowed_responses_count) {
            setAllowedResponsesCount(data.allowed_responses_count);
          }
        }
      } catch (error) {
        console.error("Error fetching organization data:", error);
      }
    };

    fetchOrganizationData();
  }, [organization]);

  useEffect(() => {
    const fetchResponsesCount = async () => {
      if (!organization || currentPlan !== "free") {
        return;
      }

      setLoading(true);
      try {
        const totalResponses =
          await ResponseService.getResponseCountByOrganizationId(
            organization.id,
          );
        const hasExceededLimit = totalResponses >= allowedResponsesCount;
        if (hasExceededLimit) {
          setCurrentPlan("free_trial_over");
          await InterviewService.deactivateInterviewsByOrgId(organization.id);
          await ClientService.updateOrganization(
            { plan: "free_trial_over" },
            organization.id,
          );
        }
      } catch (error) {
        console.error("Error fetching responses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResponsesCount();
  }, [organization, currentPlan, allowedResponsesCount]);

  // Fetch all interviewers for the interviews
  useEffect(() => {
    const fetchInterviewers = async () => {
      if (interviews.length === 0) return;
      
      try {
        // Get unique interviewer IDs without using Set spread operator to avoid linter issues
        const interviewerIds = interviews.map(item => item.interviewer_id.toString());
        const uniqueInterviewerIds = Array.from(new Set(interviewerIds));
        
        const interviewersData: Record<string, any> = {};
        
        for (const id of uniqueInterviewerIds) {
          const interviewer = await InterviewerService.getInterviewer(BigInt(id));
          if (interviewer) {
            interviewersData[id] = interviewer;
          }
        }
        
        setInterviewers(interviewersData);
      } catch (error) {
        console.error("Error fetching interviewers:", error);
      }
    };
    
    fetchInterviewers();
  }, [interviews]);

  // Get unique interviewers for filtering
  const uniqueInterviewers = useMemo(() => {
    return Object.values(interviewers);
  }, [interviewers]);

  // Filter interviews by interviewer if activeFilter is set
  const filteredInterviews = useMemo(() => {
    if (!activeFilter) return interviews;
    return interviews.filter(interview => 
      interview.interviewer_id.toString() === activeFilter
    );
  }, [interviews, activeFilter]);

  // Calculate response statistics
  useEffect(() => {
    const fetchTotalResponses = async () => {
      let total = 0;
      
      for (const interview of filteredInterviews) {
        try {
          const responses = await ResponseService.getAllResponses(interview.id.toString());
          total += responses.length;
        } catch (error) {
          console.error("Error fetching responses for interview:", error);
        }
      }
      
      setTotalResponses(total);
    };
    
    fetchTotalResponses();
  }, [filteredInterviews]);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Interviews</h1>
          <p className="text-slate-500 mt-1">Create and manage your interview experiences</p>
        </div>
        <div className="flex items-center gap-3">
          <Card className="px-4 py-3 flex items-center gap-2 border-slate-200 shadow-sm">
            <BarChart3 className="text-primary w-5 h-5" />
            <div>
              <p className="text-sm font-medium text-slate-600">Total Interviews</p>
              <p className="text-xl font-bold text-slate-800">{filteredInterviews.length}</p>
            </div>
          </Card>
          
          <Card className="px-4 py-3 flex items-center gap-2 border-slate-200 shadow-sm">
            <Users className="text-indigo-500 w-5 h-5" />
            <div>
              <p className="text-sm font-medium text-slate-600">Responses</p>
              <p className="text-xl font-bold text-slate-800">{totalResponses}</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Interview Gallery</h2>
          <div className="flex items-center gap-4">
            {uniqueInterviewers.length > 0 && (
              <div className="flex items-center gap-2 mr-4">
                <span className="text-sm text-slate-500">Filter:</span>
                <div className="flex -space-x-2">
                  {uniqueInterviewers.map((interviewer, index) => (
                    <button 
                      key={interviewer.id}
                      onClick={() => setActiveFilter(activeFilter === interviewer.id.toString() ? null : interviewer.id.toString())}
                      className={`relative rounded-full w-8 h-8 border-2 transition-all duration-200 ${
                        activeFilter === interviewer.id.toString() 
                          ? 'border-primary scale-110 z-10' 
                          : 'border-white hover:scale-105 hover:z-10'
                      }`}
                      title={interviewer.name}
                    >
                      <Image 
                        src={interviewer.image || "/default-avatar.png"} 
                        alt={interviewer.name}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                      />
                    </button>
                  ))}
                  {activeFilter && (
                    <button 
                      onClick={() => setActiveFilter(null)}
                      className="ml-2 text-xs text-slate-500 hover:text-slate-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}
            
            <Tabs defaultValue="grid" className="h-9" onValueChange={(value) => setViewMode(value as "grid" | "list")}>
              <TabsList className="grid grid-cols-2 h-8 w-20">
                <TabsTrigger value="grid" className="p-0">
                  <LayoutGrid className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="list" className="p-0">
                  <List className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        <div className={`relative ${viewMode === "grid" ? "flex flex-wrap gap-4" : "space-y-3"}`}>
          {currentPlan == "free_trial_over" ? (
            <Card className="flex bg-gradient-to-br from-slate-50 to-slate-100 items-center border-dashed border-slate-300 border hover:shadow-md transition-all duration-300 ease-in-out h-64 w-64 rounded-xl shrink-0 overflow-hidden hover-lift">
              <CardContent className="flex items-center flex-col mx-auto p-6">
                <div className="flex flex-col justify-center items-center w-full mb-4">
                  <Plus size={64} strokeWidth={1} className="text-slate-400" />
                </div>
                <CardTitle className="text-center text-slate-700 mb-2">Upgrade Required</CardTitle>
                <p className="text-sm text-center text-slate-500">You cannot create more interviews unless you upgrade</p>
              </CardContent>
            </Card>
          ) : (
            <CreateInterviewCard />
          )}
          
          {interviewsLoading || loading ? (
            <InterviewsLoader />
          ) : (
            <>
              {filteredInterviews.map((item) => (
                <div className={viewMode === "list" ? "w-full animate-fade-in" : "animate-fade-in"} key={item.id}>
                  <InterviewCard
                    id={item.id}
                    interviewerId={item.interviewer_id}
                    name={item.name}
                    url={item.url ?? ""}
                    readableSlug={item.readable_slug}
                    interviewer={interviewers[item.interviewer_id.toString()]}
                    viewMode={viewMode}
                    createdAt={item.created_at}
                  />
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {isModalOpen && (
        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="flex flex-col space-y-5">
            <div className="flex justify-center">
              <div className="bg-blue-50 p-3 rounded-full">
                <Gem className="text-primary w-6 h-6" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-center text-slate-800">Upgrade to Pro</h3>
            <p className="text-slate-600 text-center">
              You've reached your limit for the free trial. Upgrade to pro to continue using all features.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex justify-center items-center">
                <Image
                  src={"/premium-plan-icon.png"}
                  alt="Premium Plan"
                  width={200}
                  height={200}
                  className="object-contain"
                />
              </div>

              <div className="grid grid-rows-2 gap-3">
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                  <h4 className="text-lg font-medium text-slate-800 mb-2">Free Plan</h4>
                  <ul className="space-y-1">
                    <li className="flex items-center text-sm text-slate-600">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-2"></span>
                      10 Responses
                    </li>
                    <li className="flex items-center text-sm text-slate-600">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-2"></span>
                      Basic Support
                    </li>
                    <li className="flex items-center text-sm text-slate-600">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-2"></span>
                      Limited Features
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 border border-primary/30 rounded-lg bg-blue-50">
                  <h4 className="text-lg font-medium text-primary mb-2">Pro Plan</h4>
                  <ul className="space-y-1">
                    <li className="flex items-center text-sm text-slate-600">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                      Flexible Pay-Per-Response
                    </li>
                    <li className="flex items-center text-sm text-slate-600">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                      Priority Support
                    </li>
                    <li className="flex items-center text-sm text-slate-600">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                      All Features
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-2">
              <p className="text-sm text-slate-600">
                Contact <span className="font-semibold text-primary">info@hrone.cloud</span> to upgrade your plan.
              </p>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="mt-4 w-full bg-primary text-white py-2.5 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

export default Interviews;
