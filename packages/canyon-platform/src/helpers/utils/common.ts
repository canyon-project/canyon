// 用于文件base64解码后的格式化
export function getDecode(str: string) {
  return decodeURIComponent(
    atob(str)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );
}

export function getCOlor(num) {
  if (num >= 80) {
    return 'rgb(33,181,119)';
  } else if (num >= 50) {
    return 'rgb(244,176,27)';
  } else {
    return 'rgb(245,32,32)';
  }
}

export function percent(covered, total) {
  let tmp;
  if (total > 0) {
    tmp = (1000 * 100 * covered) / total;
    return Math.floor(tmp / 10) / 100;
  } else {
    return 100.0;
  }
}
