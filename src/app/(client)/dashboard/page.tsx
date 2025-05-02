"use client";

import React, { useState, useEffect } from "react";
import { useOrganization } from "@clerk/nextjs";
import InterviewCard from "@/components/dashboard/interview/interviewCard";
import CreateInterviewCard from "@/components/dashboard/interview/createInterviewCard";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { InterviewService } from "@/services/interviews.service";
import { ClientService } from "@/services/clients.service";
import { ResponseService } from "@/services/responses.service";
import { useInterviews } from "@/contexts/interviews.context";
import Modal from "@/components/dashboard/Modal";
import { ChevronRight, Gem, Plus, BarChart3 } from "lucide-react";
import Image from "next/image";

function Interviews() {
  const { interviews, interviewsLoading } = useInterviews();
  const { organization } = useOrganization();
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPlan, setCurrentPlan] = useState<string>("");
  const [allowedResponsesCount, setAllowedResponsesCount] =
    useState<number>(10);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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
              <p className="text-xl font-bold text-slate-800">{interviews.length}</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Recent Interviews</h2>
          <button className="text-primary text-sm font-medium flex items-center hover:text-primary/80 transition-colors">
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        
        <div className="relative flex flex-wrap gap-4">
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
              {interviews.map((item) => (
                <InterviewCard
                  id={item.id}
                  interviewerId={item.interviewer_id}
                  key={item.id}
                  name={item.name}
                  url={item.url ?? ""}
                  readableSlug={item.readable_slug}
                />
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
