import React from 'react';
import { Activity, Database, CheckCircle, RefreshCw, Zap } from 'lucide-react';
import { KafkaTopicStats, RedisIdempotencyLock } from '../types';

interface Props {
  kafkaStats: KafkaTopicStats;
  redisLocks: RedisIdempotencyLock[];
  onRefresh: () => void;
}

export const PipelineMonitor: React.FC<Props> = ({ kafkaStats, redisLocks, onRefresh }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Kafka Event Broker Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400 animate-pulse" />
            <h3 className="font-semibold text-slate-200">Apache Kafka Event Stream</h3>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            HEALTHY (KRaft Mode)
          </span>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded border border-slate-800">
            <span className="text-slate-400 text-xs">Topic Name</span>
            <span className="font-mono text-xs font-semibold text-amber-300">{kafkaStats.topic}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-950/60 p-2 rounded border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Published</div>
              <div className="text-lg font-bold text-slate-100">{kafkaStats.totalMessagesPublished}</div>
            </div>
            <div className="bg-slate-950/60 p-2 rounded border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Consumed</div>
              <div className="text-lg font-bold text-emerald-400">{kafkaStats.totalMessagesConsumed}</div>
            </div>
            <div className="bg-slate-950/60 p-2 rounded border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Lag</div>
              <div className="text-lg font-bold text-sky-400">{kafkaStats.lag}</div>
            </div>
          </div>
          <div className="text-xs text-slate-400 flex justify-between pt-1">
            <span>Consumer Group:</span>
            <span className="font-mono text-slate-300">{kafkaStats.consumerGroup}</span>
          </div>
        </div>
      </div>

      {/* Redis Idempotency Lock Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-rose-400" />
            <h3 className="font-semibold text-slate-200">Redis Idempotency Store</h3>
          </div>
          <button
            onClick={onRefresh}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        <div className="text-xs text-slate-400 mb-2">
          Tracking <span className="font-mono text-rose-300">X-GitHub-Delivery</span> keys (TTL: 86,400s)
        </div>

        <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
          {redisLocks.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-xs italic bg-slate-950/50 rounded border border-slate-800">
              No active webhook delivery locks stored. Trigger a PR webhook to view SETNX locks.
            </div>
          ) : (
            redisLocks.map((lock, idx) => (
              <div key={idx} className="flex items-center justify-between bg-slate-950/80 p-2 rounded border border-slate-800 text-xs">
                <div className="flex items-center gap-1.5 truncate">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-mono text-slate-300 truncate">{lock.deliveryId}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                    TTL: {lock.ttlRemainingSeconds}s
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">LOCKED</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
