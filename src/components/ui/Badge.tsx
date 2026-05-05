import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-brand text-white hover:bg-brand/80",
        secondary: "border-transparent bg-bg-muted text-text-secondary hover:bg-bg-muted/80",
        success: "bg-success-light text-success border border-success/20",
        warning: "bg-warning-light text-warning border border-warning/20",
        danger: "bg-danger-light text-danger border border-danger/20",
        outline: "text-text-primary border border-border-strong",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
