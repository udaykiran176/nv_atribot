import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 uppercase tracking-wide",
  {
      variants: {
        variant: {
          default:
            "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer",
          
          destructive:
            "bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer",

          outline:
            "border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer",

          secondary:
            "bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer",

          ghost: "hover:bg-accent hover:text-accent-foreground cursor-pointer", 

          link: "text-primary underline-offset-4 hover:underline cursor-pointer",

          // custom
          locked:
            "bg-neutral-200 text-primary-foreground hover:bg-neutral-200/90 border-neutral-400 border-b-4 active:border-b-0 cursor-pointer",

          primary:
            "bg-blue-400 text-primary-foreground hover:bg-blue-400/90 border-blue-500 border-b-4 active:border-b-0 cursor-pointer",
          primaryOutline: "bg-white border border-blue-500 text-blue-500 hover:bg-blue-500/10 cursor-pointer",

          secondaryCustom:
            "bg-orange-500 text-primary-foreground hover:bg-orange-500/90 border-orange-600 border-b-4 active:border-b-0 cursor-pointer",
          secondaryOutline: "bg-white text-orange-500 hover:bg-slate-100 cursor-pointer",

          danger:
            "bg-rose-500 text-primary-foreground hover:bg-rose-500/90 border-rose-600 border-b-4 active:border-b-0 cursor-pointer",
          dangerOutline: "bg-white text-rose-500 hover:bg-slate-100 cursor-pointer",

          super:
            "bg-indigo-500 text-primary-foreground hover:bg-indigo-500/90 border-indigo-600 border-b-4 active:border-b-0 cursor-pointer",
          superOutline: "bg-white text-indigo-500 hover:bg-slate-100 cursor-pointer",   

          sidebar:
            "bg-transparent text-slate-500 border-2 border-transparent hover:bg-slate-100 transition-none cursor-pointer",
          sidebarOutline:
            "bg-orange-500/15 text-orange-500 border-orange-300 border-2 hover:bg-orange-500/20 transition-none cursor-pointer",
        },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-12 px-8",
        icon: "h-10 w-10",

        // custom
        rounded: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };