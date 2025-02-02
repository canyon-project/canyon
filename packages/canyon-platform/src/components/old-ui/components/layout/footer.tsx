const AppFooter = ({ name, corp }) => {
  return (
    <footer className={"mx-auto w-[1200px] px-6 pb-20 pt-16"}>
      <div
        style={{
          fontSize: "20px",
          fontWeight: "bolder",
          marginBottom: "20px",
        }}
      >
        {name}
      </div>
      MIT 2025 © Canyon.
    </footer>
  );
};

export default AppFooter;
