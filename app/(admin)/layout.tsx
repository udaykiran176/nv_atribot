import { ReactNode } from "react";
import { AdminHeader } from "./header";
import { Sidebar } from "./sidebar";

const adminLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader />
      <Sidebar />

      <main className="flex flex-1 flex-col items-center justify-center">
        {children}
      </main>
    </div>
  );
};