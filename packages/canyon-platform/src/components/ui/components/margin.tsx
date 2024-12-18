import type { FC, ReactNode } from "react";
import { cn } from "@/lib/utils.ts";

const Margin: FC<{ children: ReactNode }> = ({ children }) => {
  return <div className={cn("m-auto", "w-[1250px]")}>{children}</div>;
};
export default Margin;
