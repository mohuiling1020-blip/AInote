'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Crown, Sparkles } from 'lucide-react';

interface AccountInfo {
  tier: string;
  usage: { noteCreate: number; aiProcess: number; dailyReview: number };
  limits: { noteCreate: number; aiProcess: number; dailyReview: number };
  email: string | null;
  name: string | null;
  createdAt: string;
}

function UsageBar({ label, current, limit }: { label: string; current: number; limit: number }) {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : Math.min((current / limit) * 100, 100);
  const isAtLimit = !isUnlimited && current >= limit;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">{label}</span>
        <span className={`font-medium ${isAtLimit ? 'text-red-500' : 'text-gray-700'}`}>
          {isUnlimited ? '无限制' : `${current} / ${limit}`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isAtLimit ? 'bg-red-400' : percentage > 70 ? 'bg-amber-400' : 'bg-morandi-sage'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}

interface AccountOverviewProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountOverview({ isOpen, onClose }: AccountOverviewProps) {
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const fetchAccount = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/account');
      if (res.ok) {
        setAccount(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch account:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchAccount();
    }
  }, [isOpen, fetchAccount]);

  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro', period: 'monthly' }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      console.error('Checkout failed:', err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!isOpen) return null;

  const isPro = account?.tier === 'active' || account?.tier === 'canceling';
  const tierLabel = isPro ? 'Pro' : 'Free';
  const tierStatusMap: Record<string, string> = {
    canceling: '将在周期结束后取消',
    past_due: '付款逾期',
    canceled: '已取消',
  };
  const tierStatus = account?.tier ? tierStatusMap[account.tier] : null;

  return (
    <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-morandi-sage/10 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-[0_30px_60px_-15px_rgba(148,159,151,0.2)] p-8 w-[420px] max-w-[90%] border border-white/60 ring-1 ring-white/80">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif text-gray-800">账户</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors p-1 hover:bg-black/5 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-morandi-sage/30 border-t-morandi-sage rounded-full animate-spin" />
          </div>
        ) : account ? (
          <div className="space-y-6">
            {/* Plan Badge */}
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                isPro
                  ? 'bg-morandi-sage/15 text-morandi-sage'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {isPro ? <Crown className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                {tierLabel}
              </div>
              {tierStatus && (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  {tierStatus}
                </span>
              )}
            </div>

            {/* Today's Usage */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">今日用量</h3>
              <div className="space-y-3">
                <UsageBar
                  label="笔记创建"
                  current={account.usage.noteCreate}
                  limit={account.limits.noteCreate}
                />
                <UsageBar
                  label="AI 处理"
                  current={account.usage.aiProcess}
                  limit={account.limits.aiProcess}
                />
                <UsageBar
                  label="每日复盘"
                  current={account.usage.dailyReview}
                  limit={account.limits.dailyReview}
                />
              </div>
            </div>

            {/* Upgrade CTA or Manage */}
            {!isPro ? (
              <button
                onClick={handleUpgrade}
                disabled={checkoutLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-morandi-sage text-white font-medium hover:bg-morandi-sage/90 transition-all hover:shadow-lg hover:shadow-morandi-sage/25 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {checkoutLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Crown className="w-4 h-4" />
                    升级到 Pro · 无限制使用
                  </>
                )}
              </button>
            ) : (
              <div className="text-center text-sm text-gray-500">
                感谢订阅 Pro，尽情使用所有功能吧
              </div>
            )}

            {/* Member info */}
            {account.createdAt && (
              <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-100">
                注册于 {new Date(account.createdAt).toLocaleDateString('zh-CN')}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            加载失败，请重试
          </div>
        )}
      </div>
    </div>
  );
}
