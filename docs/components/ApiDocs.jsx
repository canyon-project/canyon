'use client';

import { RedocStandalone } from 'redoc';
import { useEffect, useState } from 'react';

export default function ApiDocs({ specUrl, spec }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">加载 API 文档中...</div>
      </div>
    );
  }

  const options = {
    hideLoading: true,
    sanitize: true,
    showExtensions: true,
    theme: {
      colors: {
        primary: {
          main: '#1976d2'
        }
      },
      typography: {
        fontSize: '14px',
        fontFamily: '"Inter", "Helvetica", "Arial", sans-serif'
      },
      sidebar: {
        backgroundColor: '#fafafa'
      }
    }
  };

  return (
    <div className="redoc-container">
      {specUrl ? (
        <RedocStandalone 
          definitionUrl={specUrl} 
          options={options}
        />
      ) : (
        <RedocStandalone 
          spec={spec} 
          options={options}
        />
      )}
      
      <style jsx global>{`
        .redoc-container {
          margin: -1rem;
        }
        
        .redoc-wrap {
          font-family: "Inter", "Helvetica", "Arial", sans-serif;
        }
        
        /* 自定义 Redoc 样式 */
        .redoc-wrap .menu-content {
          background-color: #fafafa;
        }
        
        .redoc-wrap .api-content {
          padding: 0;
        }
        
        /* 响应式设计 */
        @media (max-width: 768px) {
          .redoc-container {
            margin: -0.5rem;
          }
        }
      `}</style>
    </div>
  );
}