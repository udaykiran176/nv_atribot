import { NotebookText } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type LessonBannerProps = {
  title: string;
  description: string;
};

export const LessonBanner = ({ title, description }: LessonBannerProps) => {
  return (
    <div className="flex w-full items-center justify-between rounded-xl bg-blue-500 p-4 md:p-5 text-white">
      <div className="space-y-1.5 md:space-y-2">
        <h3 className="text-lg md:text-xl font-bold">{title}</h3>
        <p className="text-sm md:text-base">{description}</p>
      </div>

      <Link href="/lesson">
        <Button
          size="lg"
          variant="secondary"
          className="hidden border-2 border-b-4 active:border-b-2 xl:flex"
        >
          <NotebookText className="mr-2" />
          Continue
        </Button>
      </Link>
    </div>
  );
};
