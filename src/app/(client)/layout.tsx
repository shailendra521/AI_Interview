"use client";

import "../globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import Navbar from "@/components/navbar";
import Providers from "@/components/providers";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import SideMenu from "@/components/sideMenu";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

const metadata = {
  title: "TalentAI",
  description: "AI-powered Interviews",
  openGraph: {
    title: "TalentAI",
    description: "AI-powered Interviews",
    siteName: "TalentAI",
    images: [
      {
        url: "/TalentAI.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuth = pathname.includes("/sign-in") || pathname.includes("/sign-up");

  return (
    <html lang="en" className="light">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <link rel="icon" href="/browser-client-icon.ico" />
      </head>
      <body
        className={cn(
          inter.className,
          "antialiased min-h-screen bg-background",
        )}
      >
        <ClerkProvider
          signInFallbackRedirectUrl={"/dashboard"}
          afterSignOutUrl={"/sign-in"}
        >
          <Providers>
            {!isAuth && <Navbar />}
            <div className="flex flex-row min-h-screen">
              {!isAuth && <SideMenu />}
              <main className={cn(
                "w-full transition-all duration-300 overflow-auto",
                !isAuth ? "ml-[220px] pt-16" : ""
              )}>
                <div className={cn(
                  "fade-in",
                  isAuth ? "w-full" : "py-6 px-8"
                )}>
                  {children}
                </div>
              </main>
            </div>
            <Toaster
              position="top-right"
              expand={false}
              richColors
              closeButton
              toastOptions={{
                classNames: {
                  toast: "bg-white border border-slate-200 shadow-lg",
                  title: "text-slate-800 font-medium",
                  description: "text-slate-600",
                  actionButton: "bg-primary hover:bg-primary/90",
                  cancelButton: "bg-slate-200 text-slate-600 hover:bg-slate-300",
                  closeButton: "text-slate-400 hover:text-slate-500",
                },
              }}
            />
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
