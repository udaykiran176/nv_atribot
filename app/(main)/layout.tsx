import type { PropsWithChildren } from "react";
import { Sidebar } from "./sidebar";
import { db } from "@/db/drizzle";
import { licenseKeys } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MobileBottomNav } from "./MobileBottomNav";


const MainLayout = async ({ children }: PropsWithChildren) => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/kit_activation");
  }
  const rows = await db.select().from(licenseKeys).where(and(eq(licenseKeys.assignedUserId, userId), eq(licenseKeys.used, true)));
  if (!rows.length) {
    redirect("/kit_activation");
  }

  return (
    <>
    
      <Sidebar />
      <main className="h-full pt-[50px] md:pl-[72px] md:pt-0 lg:pl-[256px]">
        <div className="mx-auto h-full max-w-[1056px] pb-16 pt-6 md:pb-0">{children}</div>
      </main>

       <MobileBottomNav />
    
    </>
  );
};

export default MainLayout;
