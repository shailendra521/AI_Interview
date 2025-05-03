"use client";

import React from "react";
import { PlayCircleIcon, MessageSquareIcon, UsersIcon, BarChart2, Sparkles } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

function SideMenu() {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    {
      icon: <PlayCircleIcon className="w-5 h-5" />,
      label: "Interviews",
      route: "/dashboard",
      active: pathname.endsWith("/dashboard") || pathname.includes("/interviews")
    },
    {
      icon: <MessageSquareIcon className="w-5 h-5" />,
      label: "Interviewers",
      route: "/dashboard/interviewers",
      active: pathname.endsWith("/interviewers")
    },
    {
      icon: <UsersIcon className="w-5 h-5" />,
      label: "Candidates",
      route: "/dashboard/candidates",
      active: pathname.endsWith("/candidates")
    },
    {
      icon: <BarChart2 className="w-5 h-5" />,
      label: "Analytics",
      route: "/dashboard/analytics",
      active: pathname.endsWith("/analytics")
    }
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-black/80 backdrop-blur-md border-r border-[#02563D]/30">
      <div className="flex flex-col h-full py-8 gap-8">
        <div className="px-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.route}
              onClick={() => router.push(item.route)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300
                ${item.active 
                  ? "bg-gradient-to-r from-[#02563D]/30 to-emerald-900/20 text-white shadow-lg shadow-[#02563D]/20" 
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-[#02563D]/10"}`}
            >
              <span className={`${item.active ? "text-emerald-400" : "text-neutral-400"}`}>
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
              {item.active && (
                <div className="absolute right-2 opacity-50">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Pro Tip Card */}
        <div className="px-6">
          <div className="relative p-4 rounded-xl bg-gradient-to-br from-[#02563D]/20 via-black to-emerald-900/10 border border-[#02563D]/30">
            <div className="absolute top-2 right-2">
              <Sparkles className="w-4 h-4 text-emerald-400/40" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-2">Pro Tip</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Customize your interview experience by adding unique questions and adjusting the difficulty level.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SideMenu;
