import Image from "next/image";
import { CardTitle } from "@/components/ui/card";
import { Interviewer } from "@/types/interviewer";
import { User } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface Props {
  interviewer: Interviewer;
}

function InterviewerDetailsModal({ interviewer }: Props) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {interviewer?.image ? (
              <Image
                src={interviewer.image}
                alt={`${interviewer?.name || 'Interviewer'}`}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-slate-300" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              {interviewer?.name}
            </h2>
            <p className="text-base text-slate-600">
              Hi! I'm {interviewer?.name?.split(' ')[0]}, an enthusiastic and empathetic interviewer who loves to explore. With a perfect balance of empathy and rapport, I delve deep into conversations while maintaining a steady pace.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium text-slate-900 mb-6">Interviewer Settings</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium text-slate-700">Empathy</span>
                    <span className="text-sm text-slate-600">0.7</span>
                  </div>
                  <Slider
                    defaultValue={[0.7]}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium text-slate-700">Explore</span>
                    <span className="text-sm text-slate-600">1.0</span>
                  </div>
                  <Slider
                    defaultValue={[1.0]}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium text-slate-700">Rapport</span>
                    <span className="text-sm text-slate-600">0.7</span>
                  </div>
                  <Slider
                    defaultValue={[0.7]}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium text-slate-700">Speed</span>
                    <span className="text-sm text-slate-600">0.5</span>
                  </div>
                  <Slider
                    defaultValue={[0.5]}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900">Voice Sample</h3>
            <div className="w-full bg-slate-50 rounded-xl p-4">
              <audio 
                controls 
                className="w-full"
                src={interviewer?.audio}
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewerDetailsModal;
