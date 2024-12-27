import * as dayjs from "dayjs";

export const within30days = (time) => {
    // 获取当前日期
    const currentDate = dayjs();
    // 获取item的更新日期
    const updatedAt = dayjs(time);
    // 计算当前日期和更新日期之间的天数差
    const differenceInDays = currentDate.diff(updatedAt, "day");
    // 判断是否在30天以内
    return differenceInDays <= 30;
};
