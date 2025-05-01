import Link from "next/link";
import React from "react";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { BookUserIcon } from "lucide-react";

function Navbar() {
  return (
    <div className="fixed inset-x-0 top-0 bg-white border-b border-slate-200 z-[10] h-16 shadow-sm">
      <div className="flex items-center justify-between h-full gap-2 px-6 mx-auto max-w-screen-2xl">
        <div className="flex flex-row gap-4 items-center">
          <Link href={"/dashboard"} className="flex items-center gap-2">
            <div className="bg-primary rounded-md p-1.5 text-white">
              <BookUserIcon size={20} />
            </div>
            <p className="text-xl font-bold text-slate-800">
              Talent<span className="text-primary">AI</span>
              <span className="ml-1 text-[10px] font-normal px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">Beta</span>
            </p>
          </Link>
          <div className="h-6 w-px bg-slate-200 mx-1" />
          <div className="my-auto">
            <OrganizationSwitcher
              afterCreateOrganizationUrl="/dashboard"
              hidePersonal={true}
              afterSelectOrganizationUrl="/dashboard"
              afterLeaveOrganizationUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: "my-auto",
                  organizationSwitcherTrigger: "py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                },
                variables: {
                  fontSize: "0.9rem",
                  colorPrimary: "rgb(59 130 246)",
                },
              }}
            />
          </div>
        </div>
        <div className="flex items-center">
          <UserButton 
            afterSignOutUrl="/sign-in" 
            signInUrl="/sign-in" 
            appearance={{
              elements: {
                userButtonAvatarBox: "w-9 h-9",
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Navbar;
