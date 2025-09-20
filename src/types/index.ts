/**
 * Follow-up Actions Plugin - 类型定义
 * 标准化的 LobeChat 插件类型
 */

// 标准的 LobeChat 初始化数据结构
export interface LobeInitData {
  payload: {
    apiName: string;
    arguments: string;
    id: string;
    identifier: string;
    type: string;
  };
  settings?: Record<string, any>;   // 插件设置
  state?: Record<string, any>;      // 插件状态
  tool_call_id?: string;           // 工具调用ID，用于数据隔离
  type: string;                    // 'lobe-chat:init-standalone-plugin'
  userId?: string;                  // 用户ID，用于权限控制
}

// 跟进操作状态
export type FollowUpStatus = 'pending' | 'yes' | 'no';

// 跟进操作类型
export type FollowUpActionType = 
  | 'school_attendance_follow_up'
  | 'web_access_logs_follow_up' 
  | 'ap_analysis_follow_up'
  | 'admissions_volume_follow_up'
  | 'thousandeyes_analysis_follow_up';

// 跟进操作数据结构
export interface FollowUpData {
  actionType: FollowUpActionType;
  message: string;
  noActionText: string;
  promptText: string;
  status: FollowUpStatus;
  timestamp: number;
  yesActionText: string;
}

// API响应结构
export interface FollowUpResponse {
  data: FollowUpData;
  timestamp: number;
}
