import { ClerkLoading, ClerkLoaded, UserButton } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Orbitron } from "next/font/google";

import { cn } from "@/lib/utils";

import { SidebarItem } from "./components/sidebar-item";

type SidebarProps = {
  className?: string;
};

const orbitron = Orbitron({ subsets: ["latin"] });

export const Sidebar = ({ className }: SidebarProps) => {
  return (
    <>
      {/* Desktop sidebar */}
      <div
        className={cn(
          "left-0 top-0 hidden h-full flex-col border-r-2 px-2 md:fixed md:flex md:w-[72px] lg:w-[256px] lg:px-4",
          className
        )}
      >
        <Link href="/">
          <div className="flex items-center gap-x-3 pb-7 pt-8 md:justify-center lg:justify-start lg:pl-4">
            <Image src="/atribot_logo.svg" alt="Mascot" height={40} width={40} />
            <h1  className={`${orbitron.className} text-2xl font-extrabold tracking-wide text-black-600 lg:block`}>
               Atri<span className="text-blue-600">Bot</span>
              </h1>
          </div>
        </Link>

        <div className="flex flex-1 flex-col gap-y-2">
          <SidebarItem label="Learn" href="/learn" iconSrc="/learn.png" />
          <SidebarItem
            label="Leaderboard"
            href="/leaderboard"
            iconSrc="/leaderboard.png"
          />
          <SidebarItem label="Quests" href="/quests" iconSrc="/quests.png" />
          <SidebarItem label="Shop" href="/shop" iconSrc="/shop.png" />
        </div>

        <div className="p-4">
          <ClerkLoading>
            <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
          </ClerkLoading>

          <ClerkLoaded>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: { userButtonPopoverCard: { pointerEvents: "initial" } },
              }}
            />
          </ClerkLoaded>
        </div>
      </div>

      {/* Mobile bottom nav removed; now a dedicated component */}
    </>
  );
};
