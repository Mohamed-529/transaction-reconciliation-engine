import React, { useState } from 'react';
import { Send, ShieldAlert, Cpu, CheckCircle, Zap, AlertOctagon } from 'lucide-react';

interface Props {
  onTriggerWebhook: (presetKey: string) => Promise<void>;
  onTriggerBurst: () => Promise<void>;
  isSubmitting: boolean;
}

export const WebhookSimulator: React.FC<Props> = ({ onTriggerWebhook, onTriggerBurst, isSubmitting }) => {
  const [activePreset, setActivePreset] = useState<string>('critical');

  const presets = [
    {
      id: 'critical',
      title: 'Payment Gateway Signature Break',
      badge: 'CRITICAL',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
      description: 'Mutates PaymentGateway.processCharge() signature with 5 downstream callers and high blast radius.'
    },
    {
      id: 'complexity',
      title: 'Deep Nesting in Transaction Loop',
      badge: 'HIGH',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: <Cpu className="w-4 h-4 text-amber-400" />,
      description: 'Adds nested while/if statements (depth 5) inside ReconciliationEngine with high cyclomatic score.'
    },
    {
      id: 'low',
      title: 'Typo & Logging Helper Update',
      badge: 'LOW',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
      description: 'Minor logging statement added inside LoggerUtil.java with zero caller mutations.'
    }
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-slate-200">GitHub Webhook Dispatcher</h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">POST /api/v1/webhooks/github</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => setActivePreset(preset.id)}
            className={`p-3.5 rounded-lg border text-left transition-all ${
              activePreset === preset.id
                ? 'bg-blue-950/40 border-blue-500/60 ring-1 ring-blue-500/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-semibold text-xs text-slate-200">
                {preset.icon}
                {preset.title}
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${preset.badgeClass}`}>
                {preset.badge}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2">{preset.description}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          disabled={isSubmitting}
          onClick={() => onTriggerWebhook(activePreset)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          {isSubmitting ? 'Dispatching Webhook...' : 'Dispatch Webhook Payload (202 Accepted)'}
        </button>

        <button
          disabled={isSubmitting}
          onClick={onTriggerBurst}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/70 text-rose-300 text-xs font-semibold transition-all cursor-pointer"
          title="Fires 4 concurrent requests with identical X-GitHub-Delivery header to test Redis idempotency SETNX lock."
        >
          <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
          Simulate Duplicate Burst (Test Redis Idempotency)
        </button>
      </div>
    </div>
  );
};
