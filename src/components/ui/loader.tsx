"use client";

import React from "react";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Loader({ size = "md", className = "" }: LoaderProps) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <div className="absolute w-full h-full rounded-full border-2 border-[#02563D]/20"></div>
      <div className="absolute w-full h-full rounded-full border-2 border-transparent border-t-[#02563D] animate-spin"></div>
    </div>
  );
} 
