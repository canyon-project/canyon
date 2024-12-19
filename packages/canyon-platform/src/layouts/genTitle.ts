function matchPattern(str: string) {
    if (
        str.includes("projects") &&
        str.split("/").length === 3 &&
        !["new"].includes(str.split("/")[2])
    ) {
        return true;
    }
}
export const genTitle = (pathname: string) => {
    if (matchPattern(pathname)) {
        return `${pathname.split("/")[2].split("-")[1]} | Overview | Canyon`;
    } else if (pathname.includes("commits")) {
        return `${pathname.split("/")[2].split("-")[1]} | Coverage Details | Canyon`;
    } else if (pathname.includes("configure")) {
        return `${pathname.split("/")[2].split("-")[1]} | Configure | Canyon`;
    } else if (pathname.includes("settings")) {
        return `Settings | Canyon`;
    }
    return `Canyon`;
};
