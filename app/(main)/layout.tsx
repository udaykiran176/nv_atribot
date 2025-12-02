import { ReactNode } from "react";
import  Header  from "./header";
import { Sidebar } from "./sidebar";

const mainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Sidebar />
  
      <main className="flex flex-1 flex-col items-center justify-center">
        {children}
      </main>
    </div>
  );
};

export default mainLayout;
