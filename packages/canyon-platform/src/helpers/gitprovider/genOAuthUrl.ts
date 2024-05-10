function redirect_uri(type) {
  return `${window.location.origin}/${type}/oauth`;
}
export const genOAuthUrl = ({ url, type, clientID }) => {
  // TODO 暂时还不知道state干嘛的
  if (type === 'github') {
    return `${url}/login/oauth/authorize?client_id=${clientID}&redirect_uri=${redirect_uri(type)}&response_type=code&scope=user&state=STATE`;
  } else if (type === 'gitlab') {
    return `https://gitlab.com/oauth/authorize?client_id=${clientID}&redirect_uri=${redirect_uri(type)}&response_type=code&state=STATE`;
  } else if (type === 'gitee') {
    return `https://gitee.com/oauth/authorize?client_id=${clientID}&redirect_uri=${redirect_uri(type)}&response_type=code`;
  } else {
    return '';
  }
};
