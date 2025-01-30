export interface AliasToken2 {
  colorPrimary: string;
  colorSuccess: string;
  colorInfo: string;
  colorWarning: string;
  colorError: string;
  colorBgLayout: string;
  colorTextBase: string;
}

export enum Theme {
  dark = "dark",
  light = "light",
}

export const lightToken: Partial<AliasToken2> = {
  colorPrimary: "#955cf4",
  colorSuccess: "#66bb6a",
  colorInfo: "#29b6f6",
  colorWarning: "#ffa726",
  colorError: "#f44336",
  colorBgLayout: "#fff",
  colorTextBase: "#000000d9",
};

export const darkToken: Partial<AliasToken2> = {
  colorPrimary: "#955cf4",
  colorSuccess: "#66bb6a",
  colorInfo: "#29b6f6",
  colorWarning: "#ffa726",
  colorError: "#f44336",
  colorBgLayout: "#202020",
  colorTextBase: "#ffffffd9",
};

export const tokenMap = {
  [Theme.light]: lightToken,
  [Theme.dark]: darkToken,
};
