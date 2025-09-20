/**
 * Follow-up Action Component - 交互式跟进操作组件
 */

import React, { useState, useCallback } from 'react';
import type { FollowUpData, FollowUpStatus } from '../types';

interface FollowUpActionComponentProps {
  data: FollowUpData;
  onStatusUpdate: (status: 'yes' | 'no') => Promise<void>;
}

export const FollowUpActionComponent: React.FC<FollowUpActionComponentProps> = ({ 
  data, 
  onStatusUpdate 
}) => {
  const [currentStatus, setCurrentStatus] = useState<FollowUpStatus>(data.status);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingButton, setProcessingButton] = useState<'yes' | 'no' | null>(null);

  // 处理Yes按钮点击
  const handleYesClick = useCallback(async () => {
    if (isProcessing || currentStatus !== 'pending') return;
    
    console.log('[follow-up-actions] 🟢 用户点击Yes');
    
    setIsProcessing(true);
    setProcessingButton('yes');
    
    try {
      // 模拟处理等待时间 (2-3秒)
      const waitTime = 2000 + Math.random() * 1000;
      console.log(`[follow-up-actions] ⏳ 开始处理，预计等待 ${Math.round(waitTime)}ms`);
      
      await new Promise<void>(resolve => {
        setTimeout(() => resolve(), waitTime);
      });
      
      console.log('[follow-up-actions] ✅ 处理完成，显示确认消息');
      setCurrentStatus('yes');
      await onStatusUpdate('yes');
      
    } finally {
      setIsProcessing(false);
      setProcessingButton(null);
    }
  }, [isProcessing, currentStatus, onStatusUpdate]);

  // 处理No按钮点击
  const handleNoClick = useCallback(async () => {
    if (isProcessing || currentStatus !== 'pending') return;
    
    console.log('[follow-up-actions] 🔴 用户点击No');
    
    setIsProcessing(true);
    setProcessingButton('no');
    
    try {
      // 模拟处理等待时间 (2-3秒)
      const waitTime = 2000 + Math.random() * 1000;
      console.log(`[follow-up-actions] ⏳ 开始处理，预计等待 ${Math.round(waitTime)}ms`);
      
      await new Promise<void>(resolve => {
        setTimeout(() => resolve(), waitTime);
      });
      
      console.log('[follow-up-actions] ✅ 处理完成，显示确认消息');
      setCurrentStatus('no');
      await onStatusUpdate('no');
      
    } finally {
      setIsProcessing(false);
      setProcessingButton(null);
    }
  }, [isProcessing, currentStatus, onStatusUpdate]);

  // 渲染内容
  const renderContent = () => {
    const { promptText, yesActionText, noActionText } = data;

    if (currentStatus === 'yes') {
      // Yes状态：显示确认消息
      return (
        <div style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(21, 128, 61, 0.1) 100%)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{
            color: '#22c55e',
            fontSize: '14px',
            fontWeight: '500',
            lineHeight: '1.5',
            whiteSpace: 'pre-line'
          }}>
            {yesActionText}
          </div>
        </div>
      );
    }

    if (currentStatus === 'no') {
      // No状态：显示灰色原文本，无按钮
      return (
        <div style={{
          background: 'rgba(15, 15, 25, 0.6)',
          border: '1px solid rgba(75, 85, 99, 0.2)',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{
            color: '#6b7280',
            fontSize: '14px',
            fontWeight: '500',
            lineHeight: '1.5',
            marginBottom: '16px'
          }}>
            💡 Follow-up:
          </div>
          <div style={{
            color: '#6b7280',
            fontSize: '14px',
            lineHeight: '1.5',
            whiteSpace: 'pre-line'
          }}>
            {noActionText}
          </div>
        </div>
      );
    }

    // Pending状态：显示问题和按钮
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.4) 0%, rgba(55, 48, 163, 0.3) 100%)',
        border: '1px solid rgba(79, 70, 229, 0.2)',
        borderRadius: '12px',
        padding: '20px'
      }}>
        <div style={{
          color: '#c4b5fd',
          fontSize: '14px',
          fontWeight: '500',
          lineHeight: '1.5',
          marginBottom: '16px'
        }}>
          💡 Follow-up:
        </div>
        
        <div style={{
          color: '#e9d5ff',
          fontSize: '14px',
          lineHeight: '1.5',
          marginBottom: '20px',
          whiteSpace: 'pre-line'
        }}>
          {promptText}
        </div>

        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
          {/* 在处理状态下只显示被点击的按钮 */}
          {(!isProcessing || processingButton === 'yes') && (
            <button
              disabled={isProcessing}
              onClick={handleYesClick}
              onMouseEnter={(e) => {
                if (!isProcessing) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isProcessing) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                opacity: isProcessing ? 0.6 : 1,
                padding: '10px 20px',
                transition: 'all 0.2s ease'
              }}
              type="button"
            >
              {isProcessing && processingButton === 'yes' ? 'Processing...' : 'Yes'}
            </button>
          )}

          {(!isProcessing || processingButton === 'no') && (
            <button
              disabled={isProcessing}
              onClick={handleNoClick}
              onMouseEnter={(e) => {
                if (!isProcessing) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isProcessing) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                opacity: isProcessing ? 0.6 : 1,
                padding: '10px 20px',
                transition: 'all 0.2s ease'
              }}
              type="button"
            >
              {isProcessing && processingButton === 'no' ? 'Processing...' : 'No'}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      background: 'transparent',
      borderRadius: '8px',
      minHeight: '120px',
      padding: '12px'
    }}>
      {renderContent()}
    </div>
  );
};
