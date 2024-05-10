export const getViewLineHeight = () => {
  const [hight, setHight] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setHight((document.querySelector('.view-line') as HTMLElement)?.offsetHeight || 0);
    }, 60);
  }, []);

  return hight;
};
