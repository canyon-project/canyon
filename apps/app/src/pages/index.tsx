import { Navigate } from "react-router-dom";

/** 根路径直接进入 Coverage 列表 */
export default function IndexRedirect() {
  return <Navigate to="/coverage" replace />;
}
