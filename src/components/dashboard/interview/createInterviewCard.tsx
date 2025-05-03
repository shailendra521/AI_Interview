"use client";

import React, { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import CreateInterviewModal from "@/components/dashboard/interview/createInterviewModal";
import Modal from "@/components/dashboard/Modal";

function CreateInterviewCard() {
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <Card
        className={`relative flex items-center border-dashed border-neutral-800 
        transition-all duration-500 ease-out h-[280px] rounded-xl overflow-hidden cursor-pointer
        bg-gradient-to-br from-[#02563D]/30 via-black to-[#02563D]/20
        hover:border-[#02563D]/40 hover:shadow-2xl hover:shadow-[#02563D]/20
        ${isHovered ? 'scale-[1.02]' : 'scale-100'}`}
        onClick={() => setOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#02563D]/10 via-emerald-400/5 to-[#02563D]/10 opacity-0 hover:opacity-100 transition-opacity duration-500" />
        
        {/* Sparkle effects */}
        <div className={`absolute top-4 right-4 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Sparkles className="w-5 h-5 text-emerald-400/50" />
        </div>
        <div className={`absolute bottom-4 left-4 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Sparkles className="w-4 h-4 text-[#02563D]/40" />
        </div>

        <CardContent className="relative flex items-center flex-col justify-center mx-auto p-8 text-center w-full z-10">
          <div className="flex flex-col justify-center items-center w-full mb-6">
            <div className={`relative p-4 rounded-full bg-gradient-to-br from-[#02563D]/20 to-emerald-600/10 
              ring-2 ring-[#02563D]/30 shadow-lg shadow-[#02563D]/20 
              group-hover:shadow-[#02563D]/30 transition-all duration-500
              ${isHovered ? 'scale-110 shadow-[#02563D]/30' : ''}`}
            >
              {/* Pulsing effect */}
              <div className="absolute inset-0 rounded-full bg-[#02563D]/20 animate-ping opacity-20" />
              <Plus 
                size={40} 
                strokeWidth={1.5} 
                className={`text-emerald-400 transition-transform duration-500 ${isHovered ? 'rotate-90 scale-110' : ''}`} 
              />
            </div>
          </div>
          <h3 className={`text-xl font-semibold mb-3 bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent
            transition-all duration-500 ${isHovered ? 'scale-105' : ''}`}>
            Create an Interview
          </h3>
          <p className="text-sm text-neutral-400">Set up a new interview experience</p>
        </CardContent>
      </Card>

      <Modal
        open={open}
        closeOnOutsideClick={false}
        onClose={() => setOpen(false)}
      >
        <CreateInterviewModal open={open} setOpen={setOpen} />
      </Modal>
    </>
  );
}

export default CreateInterviewCard;
