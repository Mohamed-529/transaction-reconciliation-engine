import React, { useState } from 'react';
import { X, Send, ShieldAlert, Cpu, CheckCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onTriggerWebhook: (presetKey: string) => Promise<void>;
  isSubmitting: boolean;
}

export const SimulateModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onTriggerWebhook,
  isSubmitting
}) => {
  const [selectedPreset, setSelectedPreset] = useState<'critical' | 'complexity' | 'low'>('critical');

  if (!isOpen) return null;

  const presets = [
    {
      id: 'critical' as const,
      title: 'Payment Gateway Signature Break',
      risk: 'Critical Risk',
      author: 'Sarah Chen · sarah-core',
      description: 'Alters PaymentGateway.processCharge() signature with 5 downstream service callers.'
    },
    {
      id: 'complexity' as const,
      title: 'Deep Nested Loops in ReconciliationEngine',
      risk: 'High Risk',
      author: 'Alex Rivera · arivera-eng',
      description: 'Adds nested while/if statements (depth 5) inside transaction tolerance verification.'
    },
    {
      id: 'low' as const,
      title: 'Typo & Logging Helper Update',
      risk: 'Low Risk',
      author: 'Devon Patel · dpatel-ops',
      description: 'Minor logging statement added in LoggerUtil.java with zero caller mutations.'
    }
  ];

  const handleDispatch = async () => {
    await onTriggerWebhook(selectedPreset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in-0 zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-semibold text-base text-white">Simulate Inbound Pull Request</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Dispatches a simulated GitHub webhook payload to <code className="text-slate-300 font-mono">/api/v1/webhooks/github</code>.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {presets.map((preset) => (
            <div
              key={preset.id}
              onClick={() => setSelectedPreset(preset.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                selectedPreset === preset.id
                  ? 'bg-slate-800/80 border-blue-500/60 ring-1 ring-blue-500/40'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs text-white">{preset.title}</span>
                <span className="text-[11px] font-mono font-medium text-slate-300">
                  {preset.risk}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mb-1.5">{preset.author}</div>
              <p className="text-xs text-slate-400">{preset.description}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleDispatch}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Dispatching...' : 'Dispatch Webhook (202 Accepted)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
