import {createBrowserRouter, createHashRouter, Link, RouterProvider} from "react-router-dom";
import Home from "./pages/home";
import About from "./pages/about";
const router = createHashRouter([
  {
    path: "/",
    element: (
      <Home/>
    ),
  },
  {
    path: "about",
    element: <About/>,
  },
]);
const App = () => {
  return <div>
    <RouterProvider router={router} />
  </div>
}

export default App
