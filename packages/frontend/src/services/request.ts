import axios from 'axios';

/** 统一请求实例：带 cookie，适用于当前前端与后端同域或代理场景 */
export const request = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default request;
