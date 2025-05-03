"use client";

import React, { useState } from "react";
import { useInterviews } from "@/contexts/interviews.context";
import { Plus } from "lucide-react";
import InterviewCard from "./card";
import CreatePopup from "./create-popup";
import Modal from "../Modal";
import Loader from "@/components/ui/loader";

export default function InterviewGallery() {
  const { interviews, isLoading } = useInterviews();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Modal open={open} onClose={() => setOpen(false)}>
        <CreatePopup setOpen={setOpen} />
      </Modal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center min-h-[300px] bg-black/20 rounded-xl">
            <Loader size="lg" className="mb-4" />
            <p className="text-neutral-400">Loading interviews...</p>
          </div>
        ) : (
          <>
            <button
              onClick={() => setOpen(true)}
              className="relative h-[200px] bg-gradient-to-br from-black to-neutral-900 rounded-xl border border-neutral-800 
                p-6 flex flex-col items-center justify-center gap-4 group hover:border-[#02563D]/50 transition-all duration-300
                hover:shadow-lg hover:shadow-[#02563D]/10"
            >
              <div className="w-12 h-12 rounded-full bg-[#02563D]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-6 h-6 text-[#02563D]" />
              </div>
              <div className="text-center">
                <h3 className="font-medium text-white mb-1">Create an Interview</h3>
                <p className="text-sm text-neutral-400">Set up a new interview experience</p>
              </div>
            </button>

            {interviews.map((interview) => (
              <InterviewCard key={interview.id.toString()} interview={interview} />
            ))}
          </>
        )}
      </div>
    </div>
  );
} 
