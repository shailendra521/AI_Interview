"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import CreateInterviewModal from "@/components/dashboard/interview/createInterviewModal";
import Modal from "@/components/dashboard/Modal";

function CreateInterviewCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        gradient
        // className="flex items-center border-dashed border-slate-300 border cursor-pointer transition-all duration-300 ease-in-out h-64 w-64 rounded-xl shrink-0 overflow-hidden hover:border-blue-200 hover:shadow-md hover-lift"
        onClick={() => {
          setOpen(true);
        }}
      >
        <CardContent className="flex items-center flex-col justify-center mx-auto p-6 text-center">
          <div className="flex flex-col justify-center items-center w-full mb-3">
            <div className="bg-blue-50 rounded-full p-4 mb-3">
              <Plus size={36} strokeWidth={1.5} className="text-primary" />
            </div>
          </div>
          <CardTitle className="text-slate-800 text-lg mb-2">
            Create an Interview
          </CardTitle>
          <p className="text-sm text-slate-500">Set up a new interview experience</p>
        </CardContent>
      </Card>
      <Modal
        open={open}
        closeOnOutsideClick={false}
        onClose={() => {
          setOpen(false);
        }}
      >
        <CreateInterviewModal open={open} setOpen={setOpen} />
      </Modal>
    </>
  );
}

export default CreateInterviewCard;
