import { message } from 'antd';
import { useCallback } from 'react';

export const useErrorHandler = () => {
  const handleError = useCallback((error: any, defaultMessage = '操作失败') => {
    console.error('Error:', error);
    
    let errorMessage = defaultMessage;
    
    if (error?.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    message.error(errorMessage);
  }, []);

  return { handleError };
};