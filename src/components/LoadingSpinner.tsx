/**
 * 加载状态组件
 */

import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div style={{
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      height: '200px',
      justifyContent: 'center'
    }}>
      {/* 加载动画 */}
      <div style={{
        animation: 'spin 1s linear infinite',
        border: '3px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '50%',
        borderTop: '3px solid #8b5cf6',
        height: '32px',
        width: '32px'
      }} />
      
      {/* 加载文本 */}
      <div style={{
        color: '#94a3b8',
        fontSize: '14px'
      }}>
        🚀 正在初始化...
      </div>

      {/* CSS 动画 */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
