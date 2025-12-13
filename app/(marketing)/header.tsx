"use client";
import { useEffect, useState } from "react";

import {
  ClerkLoaded,
  ClerkLoading,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import { Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Orbitron } from "next/font/google";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogIn } from 'lucide-react';

const orbitron = Orbitron({ subsets: ["latin"] });

const AdminDashboardButton = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/is-admin", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch admin status");
        const data = (await res.json()) as { isAdmin?: boolean };
        if (isMounted) setIsAdmin(Boolean(data && data.isAdmin));
      } catch (_) {
        if (isMounted) setIsAdmin(false);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    void checkAdmin();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading || !isAdmin) return null;

  return (
    <Link href="/admin">
      <Button size="lg" variant="secondary">dashboard</Button>
    </Link>
  );
};

export const Header = () => {
  const { isSignedIn } = useAuth();

  return (
    <>

      <header
        className={cn(
          "h-20 w-full border-b-2 border-slate-200 px-4",
        )}
      >
        <div className="mx-auto flex h-full items-center justify-between lg:max-w-screen-lg">
          <Link href="/" className="flex items-center gap-x-2 pb-7 pl-4 pt-8">
            <Image src="/atribot_logo.svg" alt="Mascot" height={40} width={40} />

            <h1 className={`${orbitron.className} text-2xl font-extrabold tracking-wide text-[#081a2e]`}>
              Atri<span className="text-blue-500">BOT</span>
            </h1>
          </Link>

          <div className="flex gap-x-3">
            <ClerkLoading>
              <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
            </ClerkLoading>
            <ClerkLoaded>
              <SignedIn>
                {/* Admin button */}
                {isSignedIn && (
                  <AdminDashboardButton />
                )}
                <UserButton />
              </SignedIn>

              <SignedOut>
                <SignInButton mode="modal">
                  <Button size="sm" variant="primary">
                    Login
                    <span className="ml-2"> <LogIn className="h-5 w-5" /> </span>
                  </Button>
                </SignInButton>
              </SignedOut>

            </ClerkLoaded>
          </div>
        </div>
      </header>
    </>
  );
};
