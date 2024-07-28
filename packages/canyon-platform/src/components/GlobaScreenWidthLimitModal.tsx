const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return windowSize;
};
const GlobaScreenWidthLimitModal = () => {
  const { width } = useWindowSize();

  useEffect(() => {
    if (width < 1424) {
      document.body.style.overflow = "hidden";
    }
    // 在组件卸载时恢复滚动
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [width]);

  return (
    <>
      {false ? (
        <div className={"fullscreen-modal"}>
          <Result
            className={"bg-white dark:bg-black rounded-lg"}
            title="你的窗口太小了，请调大一点"
          />
        </div>
      ) : null}
    </>
  );
};

export default GlobaScreenWidthLimitModal;
