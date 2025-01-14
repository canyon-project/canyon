const { Text } = Typography;
import app from "./app.json";
const AppFooter = () => {
  const lists = app.footer;
  return (
    <footer className={"mx-auto w-[1250px] px-6 pb-20 pt-16"}>
      <nav className={"grid grid-cols-4 gap-8"}>
        {lists.map((item) => {
          return (
            <div key={item.title}>
              <Text className={"text-[16px] block px-3.5 py-2"}>
                {item.title}
              </Text>
              <div>
                {item.children.map((child) => {
                  return (
                    <Text
                      key={child.label}
                      className={
                        "text-[16px] cursor-pointer px-3.5 py-2 rounded block hover:bg-[#F0F0F0] dark:hover:bg-[#1a1d1e]"
                      }
                      type={"secondary"}
                      onClick={() => {
                        window.open(child.link);
                      }}
                    >
                      {child.label}
                    </Text>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </footer>
  );
};

export default AppFooter;
