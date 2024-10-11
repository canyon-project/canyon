import { Outlet } from "react-router-dom";
import Layout from "@/components/Layout.tsx";

const Test = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default Test;
