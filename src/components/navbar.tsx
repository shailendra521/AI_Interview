import Link from "next/link";
import React from "react";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { BookUserIcon } from "lucide-react";

function Navbar() {
  return (
    <div className="fixed inset-x-0 top-0 bg-black/80 backdrop-blur-md border-b border-[#02563D]/30 z-[10] h-16">
      <div className="flex items-center justify-between h-full gap-2 px-6 mx-auto max-w-screen-2xl">
        <div className="flex flex-row gap-4 items-center">
          <Link href={"/dashboard"} className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-[#02563D] to-emerald-700 rounded-md p-1.5 text-white 
              shadow-lg shadow-[#02563D]/20 group-hover:shadow-[#02563D]/40 transition-all duration-300">
              <BookUserIcon size={20} />
            </div>
            <span className="text-lg font-semibold bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent">
              TalentAI
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <OrganizationSwitcher
            afterCreateOrganizationUrl="/dashboard"
            afterLeaveOrganizationUrl="/dashboard"
            afterSelectOrganizationUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: "flex justify-center items-center",
                organizationSwitcherTrigger: "bg-black hover:bg-[#02563D]/20 border-[#02563D]/30",
              },
            }}
          />
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-10 h-10 border-2 border-[#02563D]/30 hover:border-[#02563D]/50 transition-all duration-300",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Navbar;
