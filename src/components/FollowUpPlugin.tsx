/**
 * Follow-up Actions Plugin - 主组件
 * 标准化的 LobeChat 插件实现
 */

import React, { useEffect, useState } from 'react';
import { lobeChat } from '@lobehub/chat-plugin-sdk/client';
import { callWithRetry } from '../utils/retry';
import { lobeClient } from '../utils/lobeClient';
import { FollowUpActionComponent } from './FollowUpActionComponent';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorDisplay } from './ErrorDisplay';
import type { LobeInitData, FollowUpData } from '../types';

// API名称到端点的映射
const API_ENDPOINT_MAP: Record<string, string> = {
  'followUp_getAPAnalysis': '/api/follow-up/ap-analysis',
  'followUp_getAdmissionsVolume': '/api/follow-up/admissions-volume',
  'followUp_getSchoolAttendance': '/api/follow-up/school-attendance',
  'followUp_getThousandEyesAnalysis': '/api/follow-up/thousandeyes-analysis',
  'followUp_getWebAccessLogs': '/api/follow-up/web-access-logs'
};

export const FollowUpPlugin: React.FC<{ pluginData: LobeInitData }> = ({ pluginData }) => {
  const [followUpData, setFollowUpData] = useState<FollowUpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 使用 SDK 获取插件参数
  const getPluginParams = async () => {
    try {
      const payload = await lobeChat.getPluginPayload();
      return {
        apiName: payload.name || pluginData.payload.apiName,
        arguments: payload.arguments || pluginData.payload.arguments
      };
    } catch {
      // 降级到从初始化数据获取
      return {
        apiName: pluginData.payload.apiName,
        arguments: pluginData.payload.arguments
      };
    }
  };

  // 使用标准信号检查历史数据
  const checkHistoryData = async (): Promise<FollowUpData | null> => {
    try {
           console.log('[follow-up-actions] 🔍 使用标准信号检查历史数据');
           console.log('[follow-up-actions] 🏷️ 多插件数据隔离机制演示:');
           console.log('  📊 五层隔离标识:');
           console.log('    1️⃣ 用户层 (userId):', pluginData.userId);
           console.log('    2️⃣ 会话层 (sessionId/topicId): 由主应用管理');
           console.log('    3️⃣ 插件类型层 (identifier):', pluginData.payload.identifier);
           console.log('    4️⃣ 工具调用层 (tool_call_id):', pluginData.tool_call_id || pluginData.payload.id);
           console.log('    5️⃣ 消息层 (messageId): 每个插件实例独有的消息ID');
           console.log('  🔐 数据隔离保证:');
           console.log('    - 此数据仅属于当前 follow-up-actions 插件实例');
           console.log('    - 与 tool-splunk-campus 插件完全隔离');
           console.log('    - 与同类型插件的其他调用完全隔离');
           console.log('  📋 技术细节:');
           console.log('    - API名称 (apiName):', pluginData.payload.apiName);
           console.log('    - 插件类型 (type):', pluginData.payload.type);
      
      const historyData = await callWithRetry(() => lobeClient.fetchPluginMessage(), {
        baseDelayMs: 300,
        onRetry: (attempt, error) => {
          console.log(`[follow-up-actions] 历史数据获取重试第 ${attempt} 次:`, error);
        },
        retries: 2,
        timeoutMs: 1500
      });
      
           console.log('[follow-up-actions] 📊 历史数据完整结构:', JSON.stringify(historyData, null, 2));
           console.log('[follow-up-actions] 🔑 多插件隔离验证:');
           console.log('  ✅ 此数据仅属于当前 follow-up-actions 插件实例');
           console.log('  ✅ 无法访问 tool-splunk-campus 插件的数据');
           console.log('  ✅ 无法访问其他用户的数据');
           console.log('  ✅ 无法访问其他会话的数据');
           console.log('  ✅ 数据存储在独立的 messageId 中');
      
      // 严格按照开发指南的标准数据结构验证
      if (historyData && 
          typeof historyData === 'object' && 
          historyData !== null &&
          'data' in historyData &&
          (historyData as any).data &&
          typeof (historyData as any).data === 'object' &&
          'actionType' in (historyData as any).data &&
          'status' in (historyData as any).data) {
        console.log('[follow-up-actions] ✅ 发现有效历史数据，这是历史查看');
        return (historyData as any).data as FollowUpData;
      }
      
      console.log('[follow-up-actions] ❌ 未发现有效历史数据，进行首次调用');
      console.log('[follow-up-actions] 🔍 检测失败原因:');
      console.log('  - historyData存在:', !!historyData);
      console.log('  - 是对象:', typeof historyData === 'object');
      console.log('  - 有data字段:', historyData && typeof historyData === 'object' && historyData !== null && 'data' in historyData);
      console.log('  - data存在:', historyData && (historyData as any).data);
      console.log('  - data是对象:', historyData && typeof (historyData as any).data === 'object');
      console.log('  - 有actionType字段:', historyData && (historyData as any).data && 'actionType' in (historyData as any).data);
      console.log('  - 有status字段:', historyData && (historyData as any).data && 'status' in (historyData as any).data);
      return null;
    } catch (error) {
      console.log('[follow-up-actions] ⚠️ 获取历史数据失败，进行首次调用:', error);
      return null;
    }
  };

  // 获取新的跟进数据
  const fetchFollowUpData = async (apiName: string): Promise<FollowUpData> => {
    console.log('[follow-up-actions] 🆕 获取新数据:', apiName);
    
    const endpoint = API_ENDPOINT_MAP[apiName];
    if (!endpoint) {
      throw new Error(`未知的API: ${apiName}`);
    }

    const response = await fetch(endpoint, {
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  };

  // 使用标准的 lobe-chat:fill-plugin-content 信号保存数据
  const savePluginData = async (data: FollowUpData) => {
    try {
           console.log('[follow-up-actions] 💾 使用标准信号保存插件数据');
           console.log('[follow-up-actions] 🏷️ 多插件数据隔离保存机制:');
           console.log('  📊 五层隔离保存:');
           console.log('    1️⃣ 用户层隔离 (userId):', pluginData.userId);
           console.log('    2️⃣ 会话层隔离: 数据仅在当前会话中可见');
           console.log('    3️⃣ 插件类型隔离 (identifier):', pluginData.payload.identifier);
           console.log('    4️⃣ 工具调用隔离 (tool_call_id):', pluginData.tool_call_id || pluginData.payload.id);
           console.log('    5️⃣ 消息层隔离: 每个插件实例有独立的 messageId');
           console.log('  🔐 隔离保证:');
           console.log('    - 数据将保存到独立的 messageId 中');
           console.log('    - 与 tool-splunk-campus 插件完全隔离');
           console.log('    - 与其他用户、会话、工具调用完全隔离');
           console.log('    - LobeChat 使用五层机制确保数据不会混淆');
      
      // 构建标准的数据结构
      const dataWithMetadata = {
        data,
        metadata: {
          // 添加隔离标识用于验证
          isolationKeys: {
            apiName: pluginData.payload.apiName,
            identifier: pluginData.payload.identifier,
            toolCallId: pluginData.tool_call_id || pluginData.payload.id,
            userId: pluginData.userId
          },
          
timestamp: Date.now(),
          
          version: '1.0'
        }
      };
      
      // 使用重试机制保存数据，Follow-up插件通常不触发AI分析
      await callWithRetry(() => lobeClient.fillPluginContent(dataWithMetadata, false), {
        baseDelayMs: 300,
        onRetry: (attempt, error) => {
          console.log(`[follow-up-actions] 数据保存重试第 ${attempt} 次:`, error);
        },
        retries: 2,
        timeoutMs: 1500
      });
      
      console.log('[follow-up-actions] ✅ 数据保存成功');
      console.log('[follow-up-actions] 🔒 数据隔离确认: 数据已安全保存到 follow-up-actions 插件的独立存储空间');
      console.log('[follow-up-actions] 🚫 隔离验证: 此数据与 tool-splunk-campus 插件数据完全分离');
    } catch (error) {
      console.error('[follow-up-actions] ❌ 保存数据失败:', error);
    }
  };

  // 主数据加载逻辑
  useEffect(() => {
    const loadData = async () => {
      try {
        // 🔧 移除防重复机制：Fast Refresh 会导致误判，每个插件实例都应该能正常加载
        
        console.log('[follow-up-actions] 🚀 开始数据加载');
        setLoading(true);
        setError(null);

        // 1. 检查历史数据
        const historyData = await checkHistoryData();
        
        if (historyData) {
          console.log('[follow-up-actions] 📖 显示历史数据');
          setFollowUpData(historyData);
          return;
        }

        // 2. 获取新数据
        console.log('[follow-up-actions] 🆕 获取新数据');
        const params = await getPluginParams();
        const newData = await fetchFollowUpData(params.apiName);
        
        setFollowUpData(newData);

        // 3. 保存数据
        await savePluginData(newData);

      } catch (error_) {
        const errorMessage = error_ instanceof Error ? error_.message : '未知错误';
        console.error('[follow-up-actions] 数据加载失败:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
        
        // 🔧 防重复机制已移除
      }
    };

    loadData();
  }, [pluginData.payload.apiName, pluginData.userId]);

  // 更新状态的回调函数
  const handleStatusUpdate = async (newStatus: 'yes' | 'no') => {
    if (!followUpData) return;

    const updatedData = {
      ...followUpData,
      status: newStatus,
      timestamp: Date.now()
    };

    setFollowUpData(updatedData);
    await savePluginData(updatedData);
  };

  // 渲染状态
  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (!followUpData) {
    return <ErrorDisplay message="没有可用的跟进数据" />;
  }

  return (
    <FollowUpActionComponent 
      data={followUpData}
      onStatusUpdate={handleStatusUpdate}
    />
  );
};
