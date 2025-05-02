"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

const CreateInterviewerButton = () => {
  return (
    <Button
      asChild
      size="lg"
      className="bg-primary text-white hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md text-base px-6"
    >
      <Link href="/create-interviewer" className="flex items-center gap-2.5">
        <Plus className="h-5 w-5" />
        <span>Create Agent</span>
      </Link>
    </Button>
  );
};

export default CreateInterviewerButton;
