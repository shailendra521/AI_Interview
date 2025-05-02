"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import CreateInterviewModal from "@/components/dashboard/interview/createInterviewModal";
import Modal from "@/components/dashboard/Modal";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CreateInterviewButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        className="bg-[#02563D] hover:bg-[#02563D]/90 text-white font-medium" 
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4 mr-1.5" />
        Schedule Interview
      </Button>

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
