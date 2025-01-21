import { useRoutes } from "react-router-dom";
import routes from "~react-pages";
import { ConfigProvider, theme } from "antd";

const { darkAlgorithm } = theme;

function App() {
  return (
    <>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#0071c2",
          },
          algorithm: false ? [darkAlgorithm] : [],
        }}
      >
        {useRoutes(routes)}
      </ConfigProvider>
    </>
  );
}

export default App;
