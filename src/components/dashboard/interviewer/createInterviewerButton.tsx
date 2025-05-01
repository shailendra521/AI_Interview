"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InterviewerService } from "@/services/interviewers.service";
import axios from "axios";
import { Plus, Loader2, UserPlus } from "lucide-react";
import { useState } from "react";

function CreateInterviewerButton() {
  const [isLoading, setIsLoading] = useState(false);

  const createInterviewers = async () => {
    setIsLoading(true);
    const response = await axios.get("/api/create-interviewer", {});
    console.log(response);
    setIsLoading(false);
    InterviewerService.getAllInterviewers();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-2 font-medium"
      onClick={() => createInterviewers()}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      <span>Create Interviewers</span>
    </Button>
  );
}

export default CreateInterviewerButton;
