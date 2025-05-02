import Image from "next/image";
import { CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import ReactAudioPlayer from "react-audio-player";
import { Interviewer } from "@/types/interviewer";
import { User, BarChart, Volume2, Award, UserCheck, Zap, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  interviewer: Interviewer | undefined;
}

function InterviewerDetailsModal({ interviewer }: Props) {
  if (!interviewer) return null;

  // Calculate a visual score from 0-100 for the radar chart
  const getPercentage = (value: number) => Math.round((value / 10) * 100);
  const empathyScore = getPercentage(interviewer.empathy);
  const rapportScore = getPercentage(interviewer.rapport);
  const explorationScore = getPercentage(interviewer.exploration);
  const speedScore = getPercentage(interviewer.speed);

  // Gradient style for badges
  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-gradient-to-r from-green-500 to-emerald-600 text-white";
    if (score >= 6) return "bg-gradient-to-r from-blue-500 to-indigo-600 text-white";
    if (score >= 4) return "bg-gradient-to-r from-amber-500 to-orange-600 text-white";
    return "bg-gradient-to-r from-slate-500 to-gray-600 text-white";
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center mb-6">
          <CardTitle className="text-2xl md:text-3xl font-bold">
            {interviewer.name}
          </CardTitle>
          <p className="text-muted-foreground mt-1">Interviewer Profile</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="audio">Voice</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="w-40 h-40 md:w-52 md:h-52 flex-shrink-0 overflow-hidden rounded-2xl shadow-md relative"
              >
                {interviewer.image ? (
                  <Image
                    src={interviewer.image}
                    alt={`${interviewer.name}`}
                    fill
                    className="object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                    <User className="w-20 h-20 text-slate-300" />
                  </div>
                )}

                {/* Status badge */}
                <div className="absolute bottom-3 right-3">
                  <Badge className="bg-green-500 text-white px-2 py-1 text-xs font-medium">
                    Active
                  </Badge>
                </div>
              </motion.div>

              <div className="flex-grow space-y-4 w-full text-center md:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <h3 className="font-medium text-lg mb-2">About</h3>
                  <div className="prose prose-sm max-w-none text-gray-600 bg-slate-50 p-4 rounded-lg border">
                    <p className="text-sm md:text-base leading-relaxed">
                      {interviewer.description || "No description available."}
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="flex flex-wrap gap-2 justify-center md:justify-start"
                >
                  <Badge variant="secondary" className="px-2.5 py-1">Technical</Badge>
                  <Badge variant="secondary" className="px-2.5 py-1">Behavioral</Badge>
                  <Badge variant="secondary" className="px-2.5 py-1">Leadership</Badge>
                </motion.div>
              </div>
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-5"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 rounded-lg p-4 text-center border">
                  <UserCheck className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground mb-1">Empathy</p>
                  <div className={cn("text-sm font-medium rounded-full w-12 h-12 flex items-center justify-center mx-auto", getScoreColor(interviewer.empathy / 10))}>
                    {(interviewer.empathy / 10).toFixed(1)}
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4 text-center border">
                  <Zap className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground mb-1">Rapport</p>
                  <div className={cn("text-sm font-medium rounded-full w-12 h-12 flex items-center justify-center mx-auto", getScoreColor(interviewer.rapport / 10))}>
                    {(interviewer.rapport / 10).toFixed(1)}
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4 text-center border">
                  <Award className="h-5 w-5 text-indigo-600 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground mb-1">Exploration</p>
                  <div className={cn("text-sm font-medium rounded-full w-12 h-12 flex items-center justify-center mx-auto", getScoreColor(interviewer.exploration / 10))}>
                    {(interviewer.exploration / 10).toFixed(1)}
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4 text-center border">
                  <Clock className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground mb-1">Speed</p>
                  <div className={cn("text-sm font-medium rounded-full w-12 h-12 flex items-center justify-center mx-auto", getScoreColor(interviewer.speed / 10))}>
                    {(interviewer.speed / 10).toFixed(1)}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-5 border">
                <h3 className="text-base font-medium mb-5 text-center">
                  Interviewer Settings
                </h3>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <UserCheck className="h-4 w-4 text-blue-600" />
                      <h4 className="w-24 text-sm font-medium">Empathy</h4>
                      <div className="flex-grow flex items-center gap-2">
                        <Slider
                          value={[(interviewer.empathy || 10) / 10]}
                          max={1}
                          step={0.1}
                          className="flex-grow"
                        />
                        <span className="text-sm font-medium text-primary w-8 text-right">
                          {((interviewer.empathy || 10) / 10).toFixed(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Zap className="h-4 w-4 text-amber-600" />
                      <h4 className="w-24 text-sm font-medium">Rapport</h4>
                      <div className="flex-grow flex items-center gap-2">
                        <Slider
                          value={[(interviewer.rapport || 10) / 10]}
                          max={1}
                          step={0.1}
                          className="flex-grow"
                        />
                        <span className="text-sm font-medium text-primary w-8 text-right">
                          {((interviewer.rapport || 10) / 10).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  
                    <div className="flex items-center gap-3">
                      <Award className="h-4 w-4 text-indigo-600" />
                      <h4 className="w-24 text-sm font-medium">Exploration</h4>
                      <div className="flex-grow flex items-center gap-2">
                        <Slider
                          value={[(interviewer.exploration || 10) / 10]}
                          max={1}
                          step={0.1}
                          className="flex-grow"
                        />
                        <span className="text-sm font-medium text-primary w-8 text-right">
                          {((interviewer.exploration || 10) / 10).toFixed(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-green-600" />
                      <h4 className="w-24 text-sm font-medium">Speed</h4>
                      <div className="flex-grow flex items-center gap-2">
                        <Slider
                          value={[(interviewer.speed || 10) / 10]}
                          max={1}
                          step={0.1}
                          className="flex-grow"
                        />
                        <span className="text-sm font-medium text-primary w-8 text-right">
                          {((interviewer.speed || 10) / 10).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Audio Tab */}
          <TabsContent value="audio">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-slate-50 p-6 rounded-lg border flex flex-col items-center space-y-5"
            >
              <Volume2 className="h-10 w-10 text-muted-foreground/70" />
              <h3 className="font-medium text-lg text-center">Interviewer Voice</h3>
              
              {interviewer.audio ? (
                <div className="w-full max-w-md">
                  <div className="p-4 bg-white rounded-lg shadow-sm border">
                    <ReactAudioPlayer 
                      src={`/audio/${interviewer.audio}`}
                      controls
                      className="w-full"
                      style={{ maxWidth: "100%" }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 text-center">
                    Listen to how this interviewer will sound during the interview
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-muted-foreground">
                    No voice sample available for this interviewer.
                  </p>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

export default InterviewerDetailsModal;
