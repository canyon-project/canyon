import { FC, ReactNode, useEffect, useState } from "react";
const { useToken } = theme;

const ScrollBasedLayout: FC<{
  sideBar: ReactNode;
  mainContent: ReactNode;
  footer: ReactNode;
}> = ({ sideBar, mainContent, footer }) => {
  const { token } = useToken();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const footer = document.getElementById("footer");

      // 检查滚动是否超过100vh
      // setIsScrolled(scrollY + window.innerHeight > footer.offsetTop);
    };

    // 添加滚动事件监听器
    window.addEventListener("scroll", handleScroll);

    setTimeout(() => {
      document.documentElement.scrollTop += 0.5;
    }, 1000);

    // 在组件卸载时移除监听器，以防止内存泄漏
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); // 仅在组件挂载和卸载时运行

  return (
    <div>
      <div
        style={{
          display: "flex",
        }}
      >
        <div
          style={{
            width: "260px",
            background: "",
            position: `${isScrolled ? "unset" : "fixed"}`,
            display: `${!isScrolled ? "unset" : "flex"}`,
            flexDirection: "column",
          }}
        >
          <div style={{ flex: "1" }}></div>

          <div>{sideBar}</div>
        </div>

        <div
          style={{
            flex: "1",
            marginLeft: `${!isScrolled ? "260px" : "0"}`,
            minHeight: "100vh",
          }}
        >
          {mainContent}
          <div
            id={"footer"}
            style={{
              height: "200px",
              borderTop: `1px solid ${token.colorBorder}`,
            }}
          >
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollBasedLayout;
