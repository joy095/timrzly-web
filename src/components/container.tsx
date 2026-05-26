import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type ContainerProps = PropsWithChildren<{
  className?: string;
}>;

export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cn("max-w-360 mx-auto px-4 sm:px-6 lg:px-8", className)}
    >
      {children}
    </div>
  );
}
