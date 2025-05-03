import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Modal from "@/components/dashboard/Modal";
import { Interviewer } from "@/types/interviewer";
import InterviewerDetailsModal from "@/components/dashboard/interviewer/interviewerDetailsModal";
import { User, MessageSquare, Award, Zap, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  interviewer: Interviewer;
}

const InterviewerCard = ({ interviewer }: Props) => {
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Calculate an average score for the interviewer
  const averageScore = Math.round(
    (interviewer.empathy + interviewer.rapport + interviewer.exploration + interviewer.speed) / 4
  );

  // Function to determine skill level based on average score
  const getSkillLevel = (score: number): { color: string; icon: JSX.Element } => {
    if (score >= 8) {
      return { 
        color: "bg-green-50 text-green-700 border-green-200",
        icon: <Award className="h-3 w-3" />
      };
    } else if (score >= 6) {
      return { 
        color: "bg-blue-50 text-blue-700 border-blue-200",
        icon: <Zap className="h-3 w-3" />
      };
    } else {
      return { 
        color: "bg-amber-50 text-amber-700 border-amber-200",
        icon: <Star className="h-3 w-3" />
      };
    }
  };

  const skillLevel = getSkillLevel(averageScore);

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <Card 
          className={cn(
            "overflow-hidden cursor-pointer border transition-all duration-300 h-full w-full flex flex-col",
            isHovered ? "shadow-lg border-primary" : "shadow-sm"
          )}
          onClick={() => setOpen(true)}
        >
          <div className="aspect-[4/3] w-full relative bg-slate-100 overflow-hidden">
            {interviewer.image ? (
              <>
                <Image
                  src={interviewer.image}
                  alt={`${interviewer.name}`}
                  fill
                  className={cn(
                    "object-cover object-center transition-transform duration-500",
                    isHovered ? "scale-110" : "scale-100"
                  )}
                />
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300",
                  isHovered ? "opacity-100" : "opacity-0"
                )} />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-16 h-16 text-slate-300" />
              </div>
            )}

            {/* Skill level badge */}
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className={cn("p-1 flex items-center", skillLevel.color)}>
                {skillLevel.icon}
              </Badge>
            </div>
          </div>

          <CardContent className="p-4 flex flex-col items-center space-y-2 flex-grow">
            <CardTitle className="text-lg text-center line-clamp-1 mt-1" title={interviewer.name}>
              {interviewer.name}
            </CardTitle>
            
            {interviewer.description && (
              <p className="text-sm text-muted-foreground text-center line-clamp-2 mt-1">
                {interviewer.description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 w-full mt-auto pt-2">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Empathy</p>
                <p className="text-sm font-medium">{(interviewer.empathy / 10).toFixed(1)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Rapport</p>
                <p className="text-sm font-medium">{(interviewer.rapport / 10).toFixed(1)}</p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="px-4 py-3 bg-muted/30 flex justify-center">
            <div className="flex items-center justify-center text-primary gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="text-sm font-medium">View details</span>
            </div>
          </CardFooter>
        </Card>
      </motion.div>

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
