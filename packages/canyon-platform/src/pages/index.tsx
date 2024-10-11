import {Outlet, useLocation, useNavigate} from "react-router-dom";
import MainLayout from "@/components/MainLayout.tsx";
import { useEffect, useState } from "react";

const Test = () => {
  const [activePath, setActivePath] = useState<string | null>(null);

  const loc = useLocation();
  const nav = useNavigate();

  useEffect(() => {
    if (loc.pathname === "/") {
      nav("/projects");
    }
    setActivePath(loc.pathname.replace("/", ""));
  }, [loc.pathname]);

  return (
    <MainLayout
      activePath={activePath}
      // onNavClick={(path) => {
      //   setActivePath(path);
      // }}
    >
      {/*{activePath}*/}
      <Outlet />
    </MainLayout>
  );
};

export default Test;
