import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import Modal from "@/components/dashboard/Modal";
import { Interviewer } from "@/types/interviewer";
import InterviewerDetailsModal from "@/components/dashboard/interviewer/interviewerDetailsModal";
import { User, MoreVertical } from "lucide-react";

interface Props {
  interviewer: Interviewer;
}

const InterviewerCard = ({ interviewer }: Props) => {
  const [open, setOpen] = useState(false);

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-emerald-50 text-emerald-600';
      case 'inactive':
        return 'bg-slate-100 text-slate-600';
      case 'draft':
        return 'bg-amber-50 text-amber-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <>
      <Card 
        className="overflow-hidden cursor-pointer hover:border-primary hover:shadow-md transition-all duration-300 h-full relative"
        onClick={() => setOpen(true)}
      >
        <button className="absolute top-3 right-3 p-2 hover:bg-slate-100 rounded-full">
          <MoreVertical className="h-5 w-5 text-slate-600" />
        </button>
        
        <div className="p-4 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
              {interviewer.image ? (
                <Image
                  src={interviewer.image}
                  alt={`${interviewer.name}`}
                  width={56}
                  height={56}
                  className="rounded-xl object-cover"
                />
              ) : (
                <User className="w-7 h-7 text-slate-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-lg text-slate-900 truncate">{interviewer.name}</h3>
              <p className="text-base text-slate-500 truncate">{interviewer.role || "Engineering Interviews"}</p>
            </div>
          </div>

          <div>
            <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${getStatusBadgeClass(interviewer.status || 'active')}`}>
              {interviewer.status || "Active"}
            </span>
          </div>

          {interviewer.personality_traits && interviewer.personality_traits.length > 0 && (
            <div className="space-y-2">
              <p className="text-base text-slate-600">Personality traits:</p>
              <div className="flex flex-wrap gap-2">
                {interviewer.personality_traits.map((trait, index) => (
                  <span 
                    key={index}
                    className="text-base bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 text-base text-slate-500">
            <span>{interviewer.interviews_count || "0"} interviews</span>
            <span>Last used: {interviewer.last_used || "Never"}</span>
          </div>
        </div>
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

export default InterviewerCard;
