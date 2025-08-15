export const request = async <T>(...args: [RequestInfo, RequestInit?]): Promise<T> => {
  const res = await fetch(...args);
  return (await res.json()) as T;
};
