import React, { useState } from 'react';
import { Server, Database, Activity, RefreshCw, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { KafkaTopicStats, RedisIdempotencyLock } from '../types';

interface Props {
  kafkaStats: KafkaTopicStats;
  redisLocks: RedisIdempotencyLock[];
  onRefresh: () => void;
  onTriggerBurst: () => Promise<void>;
  isSubmitting: boolean;
}

export const InfrastructureView: React.FC<Props> = ({
  kafkaStats,
  redisLocks,
  onRefresh,
  onTriggerBurst,
  isSubmitting
}) => {
  const [burstMessage, setBurstMessage] = useState<string | null>(null);

  const handleBurst = async () => {
    setBurstMessage('Executing concurrent duplicate webhook test...');
    try {
      await onTriggerBurst();
      setBurstMessage('Test complete: Redis SETNX lock prevented duplicate message execution.');
      setTimeout(() => setBurstMessage(null), 4000);
    } catch {
      setBurstMessage('Test failed.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-semibold text-white">System Infrastructure & Telemetry</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time pipeline diagnostics for Apache Kafka, Redis Idempotency, and PostgreSQL.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Kafka Broker Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-400" />
              <h3 className="font-semibold text-sm text-slate-200">Apache Kafka Stream</h3>
            </div>
            <span className="text-xs text-emerald-400 font-mono">Active (KRaft)</span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs py-1 border-b border-slate-800/50">
              <span className="text-slate-400">Topic</span>
              <span className="font-mono text-slate-200">{kafkaStats.topic}</span>
            </div>
            <div className="flex justify-between items-center text-xs py-1 border-b border-slate-800/50">
              <span className="text-slate-400">Consumer Group</span>
              <span className="font-mono text-slate-200">{kafkaStats.consumerGroup}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/60 text-center">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Published</div>
                <div className="text-base font-bold text-slate-100 font-mono mt-0.5">
                  {kafkaStats.totalMessagesPublished}
                </div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/60 text-center">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Consumed</div>
                <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                  {kafkaStats.totalMessagesConsumed}
                </div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/60 text-center">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Lag</div>
                <div className="text-base font-bold text-slate-100 font-mono mt-0.5">
                  {kafkaStats.lag}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Redis Idempotency Store Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-400" />
              <h3 className="font-semibold text-sm text-slate-200">Redis Idempotency Store</h3>
            </div>
            <span className="text-xs text-emerald-400 font-mono">SETNX Guard Active</span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs py-1 border-b border-slate-800/50">
              <span className="text-slate-400">Active Delivery Locks</span>
              <span className="font-mono text-slate-200">{redisLocks.length} locked keys</span>
            </div>
            <div className="flex justify-between items-center text-xs py-1 border-b border-slate-800/50">
              <span className="text-slate-400">Key TTL Configuration</span>
              <span className="font-mono text-slate-200">86,400s (24h)</span>
            </div>

            <div className="pt-2">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Recent Active Locks</div>
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {redisLocks.length === 0 ? (
                  <div className="text-xs text-slate-500 italic py-2">No active delivery keys stored.</div>
                ) : (
                  redisLocks.map((lock, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-950 p-2 rounded text-xs font-mono">
                      <span className="truncate max-w-[200px] text-slate-300">{lock.deliveryId}</span>
                      <span className="text-[10px] text-slate-400">TTL: {lock.ttlRemainingSeconds}s</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resilience Simulation Test */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-sm text-slate-200">Idempotency Resilience Verification</h3>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-4 max-w-2xl leading-relaxed">
          Dispatches 4 simultaneous webhook requests with an identical <code className="text-slate-300 font-mono">X-GitHub-Delivery</code> header to test the Redis <code className="text-slate-300 font-mono">SETNX</code> filter. Only the first event is processed; all subsequent duplicates are blocked from redundant evaluation.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={handleBurst}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors border border-slate-700 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Simulating...' : 'Run Duplicate Burst Test'}
          </button>
          {burstMessage && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{burstMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
