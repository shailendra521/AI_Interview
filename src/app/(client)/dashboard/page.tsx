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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function Interviews() {
  const { interviews, interviewsLoading } = useInterviews();
  const { organization } = useOrganization();
  const [loading, setLoading] = useState<boolean>(false);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
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
          <Card key={index} className="glass animate-pulse h-64 w-64 rounded-xl shrink-0">
            <CardContent className="p-6">
              <div className="h-4 w-3/4 bg-neutral-800 rounded mb-4"></div>
              <div className="h-4 w-1/2 bg-neutral-800 rounded mb-8"></div>
              <div className="space-y-3">
                <div className="h-3 w-full bg-neutral-800 rounded"></div>
                <div className="h-3 w-5/6 bg-neutral-800 rounded"></div>
                <div className="h-3 w-4/6 bg-neutral-800 rounded"></div>
              </div>
            </CardContent>
          </Card>
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
      if (!organization?.id || filteredInterviews.length === 0) return;
      
      setStatsLoading(true);
      try {
        const total = await ResponseService.getResponseCountByOrganizationId(organization.id);
        setTotalResponses(total);
      } catch (error) {
        console.error("Error fetching total responses:", error);
        setTotalResponses(0);
      }
      setStatsLoading(false);
    };
    
    fetchTotalResponses();
  }, [organization?.id, filteredInterviews]);

  return (
    <div className="min-h-screen bg-black animated-gradient">
      <div className="max-w-[1400px] mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>

          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold gradient-text">My Interviews</h1>
            <p className="text-neutral-400 mt-1">Create and manage your interview experiences</p>
          </div>
          <div className="flex items-center gap-4">
            <Card className="glass glass-hover p-4 flex items-start gap-3 min-w-[200px]">
              <div className="p-2 rounded-lg bg-[#02563D]/10">
                <BarChart3 className="w-5 h-5 text-[#02563D]" />
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-500">Total Interviews</p>
                <p className="text-2xl font-bold text-[#02563D]">
                  {statsLoading ? (
                    <span className="inline-block w-8 h-6 bg-neutral-800 animate-pulse rounded"></span>
                  ) : (
                    filteredInterviews.length
                  )}
                </p>
              </div>
            </Card>
            
            <Card className="glass glass-hover p-4 flex items-start gap-3 min-w-[200px]">
              <div className="p-2 rounded-lg bg-[#02563D]/10">
                <Users className="w-5 h-5 text-[#02563D]" />
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-medium text-gray-500">Responses</p>
                <p className="text-2xl font-bold text-[#02563D]">
                  {statsLoading ? (
                    <span className="inline-block w-8 h-6 bg-neutral-800 animate-pulse rounded"></span>
                  ) : (
                    totalResponses
                  )}
                </p>
              </div>
            </Card>
          </div>
        </div>

        <div className="glass rounded-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Interview Gallery</h2>
            <div className="flex items-center gap-4">
              {uniqueInterviewers.length > 0 && (
                <Select value={activeFilter || 'all'} onValueChange={(value) => setActiveFilter(value === 'all' ? null : value)}>
                  <SelectTrigger className="w-[200px] bg-black/40 border-neutral-800 text-neutral-300 hover:bg-black/60 transition-colors">
                    <SelectValue placeholder="Filter by interviewer" />
                  </SelectTrigger>
                  <SelectContent className="glass border-neutral-800">
                    <SelectItem value="all" className="text-neutral-300 hover:text-white hover:bg-[#02563D]/20">
                      All Interviewers
                    </SelectItem>
                    {uniqueInterviewers.map((interviewer) => (
                      <SelectItem
                        key={interviewer.id}
                        value={interviewer.id.toString()}
                        className="text-neutral-300 hover:text-white hover:bg-[#02563D]/20"
                      >
                        {interviewer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              <Tabs defaultValue="grid" className="h-9" onValueChange={(value) => setViewMode(value as "grid" | "list")}>
                <TabsList className="grid grid-cols-2 h-8 w-20 bg-black/40 border border-neutral-800">
                  <TabsTrigger value="grid" className="p-0 data-[state=active]:bg-[#02563D] data-[state=active]:text-white">
                    <LayoutGrid className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="list" className="p-0 data-[state=active]:bg-[#02563D] data-[state=active]:text-white">
                    <List className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <button className="text-[#02563D] text-sm font-medium flex items-center hover:text-[#02563D]/80 transition-colors">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
          
          <div className={`relative ${viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}`}>
            {currentPlan == "free_trial_over" ? (
              <Card className="flex glass glass-hover items-center border-dashed border-neutral-700 hover:border-[#02563D]/50 transition-all duration-300 ease-in-out h-[280px] rounded-xl overflow-hidden hover-lift">
                <CardContent className="flex items-center flex-col mx-auto p-6">
                  <div className="flex flex-col justify-center items-center w-full mb-4">
                    <div className="p-4 rounded-full bg-[#02563D]/10 mb-4">
                      <Plus className="w-10 h-10 text-[#02563D]" strokeWidth={1.5} />
                    </div>
                  </div>
                  <CardTitle className="text-center text-xl text-neutral-300 mb-3">Upgrade Required</CardTitle>
                  <p className="text-sm text-center text-neutral-500">You cannot create more interviews unless you upgrade</p>
                </CardContent>
              </Card>
            ) : (
              <CreateInterviewCard />
            )}
            
            {interviewsLoading ? (
              <InterviewsLoader />
            ) : (
              <>
                {filteredInterviews.map((item) => (
                  <div className="animate-fade-in" key={item.id}>
                    <InterviewCard
                      id={item.id}
                      interviewerId={item.interviewer_id}
                      name={item.name}
                      url={item.url ?? ""}
                      readableSlug={item.readable_slug}
                      interviewer={interviewers[item.interviewer_id.toString()]}
                      viewMode={viewMode}
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          className="glass"
        >
          <div className="mb-6">
            <h3 className="text-2xl font-bold gradient-text mb-2">Upgrade Your Plan</h3>
            <p className="text-neutral-400">Your free trial has ended. Upgrade to continue creating interviews.</p>
          </div>
          <div className="grid grid-rows-2 gap-4">
            <div className="glass p-6 rounded-xl">
              <h4 className="text-lg font-medium text-white mb-3">Free Plan</h4>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-neutral-400">
                  <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full mr-2"></span>
                  10 Responses
                </li>
                <li className="flex items-center text-sm text-neutral-400">
                  <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full mr-2"></span>
                  Basic Support
                </li>
                <li className="flex items-center text-sm text-neutral-400">
                  <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full mr-2"></span>
                  Limited Features
                </li>
              </ul>
            </div>
            
            <div className="glass p-6 rounded-xl border border-[#02563D]/20 bg-[#02563D]/5">
              <h4 className="text-lg font-medium gradient-text mb-3">Pro Plan</h4>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-neutral-300">
                  <span className="w-1.5 h-1.5 bg-[#02563D] rounded-full mr-2"></span>
                  Unlimited Responses
                </li>
                <li className="flex items-center text-sm text-neutral-300">
                  <span className="w-1.5 h-1.5 bg-[#02563D] rounded-full mr-2"></span>
                  Priority Support
                </li>
                <li className="flex items-center text-sm text-neutral-300">
                  <span className="w-1.5 h-1.5 bg-[#02563D] rounded-full mr-2"></span>
                  Advanced Features
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="btn-outline"
            >
              Maybe Later
            </Button>
            <Button
              onClick={() => {
                // Handle upgrade action
                setIsModalOpen(false);
              }}
              className="btn-primary"
            >
              Upgrade Now
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Interviews;
