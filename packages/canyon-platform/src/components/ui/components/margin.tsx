import type { FC, ReactNode } from "react";

const Margin: FC<{ children: ReactNode }> = ({ children }) => {
  return <div className={"m-auto w-[1250px]"}>{children}</div>;
};
export default Margin;
