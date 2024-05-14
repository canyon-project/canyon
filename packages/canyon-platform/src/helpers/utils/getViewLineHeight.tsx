export const getViewLineHeight = () => {
  const [hight, setHight] = useState(0);
  useEffect(() => {
    let count = 0;
    const timer = setInterval(() => {
      count++;
      const h = (document.querySelector('.view-line') as HTMLElement)?.offsetHeight || 0;
      if (h > 0 || count > 50) {
        // 超过30秒还没获取到高度，就不再获取
        setHight(h);
        clearInterval(timer);
      }
    }, 60);
  }, []);

  return hight;
};
