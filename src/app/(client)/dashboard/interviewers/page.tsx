"use client";

import { useInterviewers } from "@/contexts/interviewers.context";
import React, { useState, useEffect } from "react";
import InterviewerCard from "@/components/dashboard/interviewer/interviewerCard";
import CreateInterviewerButton from "@/components/dashboard/interviewer/createInterviewerButton";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Plus, Search, UserPlus, Filter, Award } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

function Interviewers() {
  const { interviewers, interviewersLoading } = useInterviewers();
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"grid" | "carousel">("grid");
  const [filteredInterviewers, setFilteredInterviewers] = useState(interviewers);
  const [sortBy, setSortBy] = useState<"name" | "newest">("newest");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    let result = [...interviewers];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(interviewer => 
        interviewer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interviewer.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    if (activeFilter) {
      // This is a placeholder for actual filtering logic based on categories
      // You would implement this based on your specific data structure
    }
    
    // Apply sorting
    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    
    setFilteredInterviewers(result);
  }, [interviewers, searchQuery, sortBy, activeFilter]);

  function InterviewersLoader() {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="h-48 w-full">
              <Skeleton className="h-full w-full rounded-none" />
            </div>
            <CardContent className="p-5 flex flex-col items-center space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  function EmptyState() {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full p-10 text-center border-dashed border-2 bg-slate-50">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="bg-primary/10 p-4 rounded-full">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-medium">No interviewers yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Create your first interviewer to get started with conducting interviews. 
                Interviewers can be customized to match your specific hiring needs.
              </p>
            </div>
            <div className="pt-4">
              <CreateInterviewerButton />
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  function SearchNotFound() {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center py-16"
      >
        <Search className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-medium mb-2">No interviewers found</h3>
        <p className="text-muted-foreground mb-6">
          No interviewers match your search criteria
        </p>
        <Button onClick={() => setSearchQuery("")} variant="outline">
          Clear Search
        </Button>
      </motion.div>
    );
  }

  const FilterBadge = ({ name, active }: { name: string; active: boolean }) => (
    <Badge
      className={cn(
        "px-3 py-1 text-sm cursor-pointer transition-all hover:bg-primary/90",
        active ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:text-white"
      )}
      onClick={() => setActiveFilter(active ? null : name)}
    >
      {name}
    </Badge>
  );

  return (
    <main className="container py-8 space-y-8 max-w-6xl mx-auto">
      {/* Header with animated badge */}
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-primary/10 p-2 rounded-full"
          >
            <Users className="h-6 w-6 text-primary" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">Interviewers</h2>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  <span>Elite</span>
                </Badge>
              </motion.div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Get to know them by clicking on their profile.
            </p>
          </div>
        </div>
        
        {/* Search and filter bar */}
        {interviewers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between py-2"
          >
            <div className="flex-1 w-full sm:max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search interviewers..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2">
                <Button
                  variant={view === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("grid")}
                  className="h-9 px-3"
                >
                  Grid
                </Button>
                <Button
                  variant={view === "carousel" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("carousel")}
                  className="h-9 px-3"
                >
                  Carousel
                </Button>
              </div>
              <CreateInterviewerButton />
            </div>
          </motion.div>
        )}
      </div>

      {/* Filtering and sorting options */}
      {interviewers.length > 0 && !interviewersLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex flex-wrap gap-3 items-center"
        >
          <span className="text-sm font-medium text-muted-foreground mr-1">Sort by:</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("h-8", sortBy === "newest" && "bg-secondary")}
            onClick={() => setSortBy("newest")}
          >
            Newest
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("h-8", sortBy === "name" && "bg-secondary")}
            onClick={() => setSortBy("name")}
          >
            Name
          </Button>
          <div className="ml-auto flex flex-wrap gap-2">
            <FilterBadge name="Technical" active={activeFilter === "Technical"} />
            <FilterBadge name="Behavioral" active={activeFilter === "Behavioral"} />
            <FilterBadge name="Leadership" active={activeFilter === "Leadership"} />
          </div>
        </motion.div>
      )}

      {/* Main content */}
      {interviewersLoading ? (
        <InterviewersLoader />
      ) : interviewers.length === 0 ? (
        <EmptyState />
      ) : filteredInterviewers.length === 0 ? (
        <SearchNotFound />
      ) : view === "carousel" ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Carousel 
            opts={{ align: "start" }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {filteredInterviewers.map((interviewer, index) => (
                <CarouselItem 
                  key={String(interviewer.id)} 
                  className="pl-4 md:basis-1/3 lg:basis-1/4"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <InterviewerCard interviewer={interviewer} />
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden sm:block">
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </div>
          </Carousel>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {filteredInterviewers.map((interviewer, index) => (
            <motion.div
              key={String(interviewer.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -5 }}
              className="h-full"
            >
              <InterviewerCard interviewer={interviewer} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </main>
  );
}

export default Interviewers;
