import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center leading-none rounded-full border px-2.5 py-[0.3rem] text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-violet-200 bg-violet-50 text-violet-800",
        outline: "border-stone-200 bg-white text-stone-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
