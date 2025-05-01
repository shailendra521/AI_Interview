import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import Modal from "@/components/dashboard/Modal";
import { Interviewer } from "@/types/interviewer";
import InterviewerDetailsModal from "@/components/dashboard/interviewer/interviewerDetailsModal";
import { User, MessageSquare } from "lucide-react";

interface Props {
  interviewer: Interviewer;
}

const interviewerCard = ({ interviewer }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card 
        className="overflow-hidden cursor-pointer hover:border-primary hover:shadow-md transition-all duration-300 h-full w-full"
        onClick={() => setOpen(true)}
        hover
        shadowed
      >
        <div className="aspect-[4/3] w-full relative bg-slate-100">
          {interviewer.image ? (
            <Image
              src={interviewer.image}
              alt={`${interviewer.name}`}
              fill
              className="object-cover object-center"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-16 h-16 text-slate-300" />
            </div>
          )}
        </div>
        <CardContent className="p-4 flex flex-col items-center space-y-1">
          <CardTitle className="text-lg text-center line-clamp-1" title={interviewer.name}>
            {interviewer.name}
          </CardTitle>
          <CardDescription className="text-center flex items-center justify-center gap-1">
            <MessageSquare className="h-3 w-3" />
            <span>View details</span>
          </CardDescription>
        </CardContent>
      </Card>
      <Modal
        open={open}
        closeOnOutsideClick={true}
        onClose={() => {
          setOpen(false);
        }}
      >
        <InterviewerDetailsModal interviewer={interviewer} />
      </Modal>
    </>
  );
};

export default interviewerCard;
