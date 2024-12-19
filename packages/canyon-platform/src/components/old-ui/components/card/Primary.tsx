import { FC } from "react";

const { useToken } = theme;
const CanyonCardPrimary: FC<{
    theme?: any;
    language?: any;
    children: any;
}> = ({ theme, language, children }) => {
    const { token } = useToken();
    return (
        <div
            className={"rounded-[8px] overflow-hidden"}
            style={{
                border: `1px solid ${token.colorBorder}`,
                boxShadow: `${token.boxShadowTertiary}`,
            }}
        >
            {children}
        </div>
    );
};

export default CanyonCardPrimary;
