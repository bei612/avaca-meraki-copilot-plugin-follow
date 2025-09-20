/**
 * AP Analysis Follow-up API - Pages Router 版本
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FollowUpResponse | { error: string; timestamp: number }>
) {
  try {
    const clientIP = req.headers['x-forwarded-for'] as string || req.connection.remoteAddress || 'unknown';
    if (!RateLimiter.check(clientIP)) {
      return res.status(429).json({
        error: '请求过于频繁，请稍后再试',
        timestamp: Date.now()
      });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({
        error: '不支持的请求方法',
        timestamp: Date.now()
      });
    }

    console.log('[follow-up-actions API] 处理AP分析跟进请求');

    await new Promise<void>(resolve => {
      setTimeout(() => resolve(), 50 + Math.random() * 100);
    });

    const response: FollowUpResponse = {
      data: {
        actionType: 'ap_analysis_follow_up',
        message: '💡 Follow-up:',
        noActionText: 'Would you like me to send this admissions breakdown and lead analysis to the Admissions team?',
        promptText: 'Would you like me to send this admissions breakdown and lead analysis to the Admissions team?',
        status: 'pending',
        timestamp: Date.now(),
        yesActionText: '✅ Email sent to Admissions team with report and event recommendations.'
      },
      timestamp: Date.now()
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    return res.status(200).json(response);

  } catch (error) {
    console.error('[follow-up-actions API] AP分析跟进处理错误:', error);

    return res.status(500).json({
      error: error instanceof Error ? error.message : '服务器内部错误',
      timestamp: Date.now()
    });
  }
}
