"use client";

import React from "react";
import { PlayCircleIcon, MessageSquareIcon, UsersIcon, BarChart2 } from "lucide-react";
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
    <div className="z-[10] bg-white border-r border-slate-200 p-4 w-[220px] fixed top-16 left-0 h-[calc(100vh-4rem)] shadow-sm">
      <div className="flex flex-col gap-2 mt-2">
        <h3 className="text-xs uppercase text-slate-500 font-semibold ml-3 mb-1">Main</h3>
        {menuItems.map((item, index) => (
          <div
            key={index}
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
              item.active
                ? "bg-primary text-white shadow-md"
                : "hover:bg-slate-100 text-slate-700"
            } slide-in-from-left`}
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => router.push(item.route)}
          >
            <div className={`${item.active ? "text-white" : "text-primary"} mr-2.5`}>
              {item.icon}
            </div>
            <p className="font-medium">{item.label}</p>
          </div>
        ))}
      </div>
      <div className="absolute bottom-6 left-4 right-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h4 className="text-sm font-semibold text-blue-800 mb-1">Pro Tip</h4>
          <p className="text-xs text-blue-700">Create custom interview templates to streamline your hiring process.</p>
        </div>
      </div>
    </div>
  );
}

export default SideMenu;
