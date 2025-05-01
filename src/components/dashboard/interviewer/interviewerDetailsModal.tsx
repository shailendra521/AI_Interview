import Image from "next/image";
import { CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import ReactAudioPlayer from "react-audio-player";
import { Interviewer } from "@/types/interviewer";
import { User } from "lucide-react";

interface Props {
  interviewer: Interviewer | undefined;
}

function InterviewerDetailsModal({ interviewer }: Props) {
  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <CardTitle className="text-2xl md:text-3xl font-semibold">
          {interviewer?.name}
        </CardTitle>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="flex flex-col md:flex-row gap-5 items-center md:items-start">
          <div className="w-36 h-36 md:w-44 md:h-44 flex-shrink-0 border-3 overflow-hidden border-gray-400 rounded-xl">
            {interviewer?.image ? (
              <Image
                src={interviewer.image}
                alt={`${interviewer?.name || 'Interviewer'}`}
                width={180}
                height={180}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-100">
                <User className="w-14 h-14 text-slate-300" />
              </div>
            )}
          </div>

          <div className="flex-grow space-y-3 w-full">
            <div className="prose prose-sm max-w-none text-gray-600">
              <p className="text-sm md:text-base leading-relaxed text-left">
                {interviewer?.description || "No description available."}
              </p>
            </div>
            
            {interviewer?.audio && (
              <div className="w-full">
                <ReactAudioPlayer 
                  src={`/audio/${interviewer.audio}`}
                  controls
                  className="w-full mt-2"
                  style={{ maxWidth: "100%" }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-slate-50 rounded-xl p-4 md:p-5">
          <h3 className="text-base font-medium mb-4 text-center md:text-left">
            Interviewer Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h4 className="w-20 text-sm font-medium">Empathy</h4>
                <div className="flex-grow flex items-center gap-2">
                  <Slider
                    value={[(interviewer?.empathy || 10) / 10]}
                    max={1}
                    step={0.1}
                    className="flex-grow"
                  />
                  <span className="text-sm font-medium text-primary w-8 text-right">
                    {((interviewer?.empathy || 10) / 10).toFixed(1)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <h4 className="w-20 text-sm font-medium">Rapport</h4>
                <div className="flex-grow flex items-center gap-2">
                  <Slider
                    value={[(interviewer?.rapport || 10) / 10]}
                    max={1}
                    step={0.1}
                    className="flex-grow"
                  />
                  <span className="text-sm font-medium text-primary w-8 text-right">
                    {((interviewer?.rapport || 10) / 10).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h4 className="w-20 text-sm font-medium">Explore</h4>
                <div className="flex-grow flex items-center gap-2">
                  <Slider
                    value={[(interviewer?.exploration || 10) / 10]}
                    max={1}
                    step={0.1}
                    className="flex-grow"
                  />
                  <span className="text-sm font-medium text-primary w-8 text-right">
                    {((interviewer?.exploration || 10) / 10).toFixed(1)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <h4 className="w-20 text-sm font-medium">Speed</h4>
                <div className="flex-grow flex items-center gap-2">
                  <Slider
                    value={[(interviewer?.speed || 10) / 10]}
                    max={1}
                    step={0.1}
                    className="flex-grow"
                  />
                  <span className="text-sm font-medium text-primary w-8 text-right">
                    {((interviewer?.speed || 10) / 10).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewerDetailsModal;
