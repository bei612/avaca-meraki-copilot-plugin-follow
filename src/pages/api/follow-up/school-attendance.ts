/**
 * School Attendance Follow-up API - Pages Router 版本
 * 兼容 Next.js Pages Router
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import type { FollowUpResponse } from '../../../types';

// 内存限流器
class RateLimiter {
  private static cache = new Map<string, { count: number; resetTime: number }>();

  static check(key: string, maxRequests = 10, windowMs = 60_000): boolean {
    const now = Date.now();
    const record = this.cache.get(key);
    
    if (!record || now > record.resetTime) {
      this.cache.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (record.count >= maxRequests) {
      return false;
    }
    
    record.count++;
    return true;
  }
}

// API 处理函数
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FollowUpResponse | { error: string; timestamp: number }>
) {
  try {
    // 限流检查
    const clientIP = req.headers['x-forwarded-for'] as string || req.connection.remoteAddress || 'unknown';
    if (!RateLimiter.check(clientIP)) {
      return res.status(429).json({
        error: '请求过于频繁，请稍后再试',
        timestamp: Date.now()
      });
    }

    // 只支持 POST 方法
    if (req.method !== 'POST') {
      return res.status(405).json({
        error: '不支持的请求方法',
        timestamp: Date.now()
      });
    }

    console.log('[follow-up-actions API] 处理学校考勤跟进请求');

    // 模拟API调用延迟
    await new Promise<void>(resolve => {
      setTimeout(() => resolve(), 50 + Math.random() * 100);
    });

    const response: FollowUpResponse = {
      data: {
        actionType: 'school_attendance_follow_up',
        message: '💡 Follow-up:',
        noActionText: 'Send a daily attendance summary with trends and at-risk student alerts at 7:30 AM?',
        promptText: 'Send a daily attendance summary with trends and at-risk student alerts at 7:30 AM?',
        status: 'pending',
        timestamp: Date.now(),
        yesActionText: '✅ Daily attendance summary scheduled. First update will arrive tomorrow at 7:30 AM via email.'
      },
      timestamp: Date.now()
    };

    // 设置响应头
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    return res.status(200).json(response);

  } catch (error) {
    console.error('[follow-up-actions API] 学校考勤跟进处理错误:', error);

    return res.status(500).json({
      error: error instanceof Error ? error.message : '服务器内部错误',
      timestamp: Date.now()
    });
  }
}
