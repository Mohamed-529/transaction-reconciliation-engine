import React, { useState } from 'react';
import { Server, ArrowRight, ShieldAlert, Cpu, GitCommit, Zap } from 'lucide-react';

interface Props {
  rootClass: string;
  downstreamCallers: string[];
  isCritical: boolean;
}

export const MicroserviceNetworkMap: React.FC<Props> = ({
  rootClass,
  downstreamCallers,
  isCritical
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const isRootHovered = hoveredNode === 'ROOT';

  if (!downstreamCallers || downstreamCallers.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-500 italic">
        Zero downstream service mutations detected. Architectural call-graph is isolated.
      </div>
    );
  }

  const primaryColor = isCritical ? 'rose' : 'amber';

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className={`w-4 h-4 ${isCritical ? 'text-rose-400' : 'text-amber-400'}`} />
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
            Active Microservice Call Graph & Blast Radius Map
          </h2>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          Hover node to trace regression propagation
        </span>
      </div>

      {/* Network Map Visual Canvas */}
      <div className="relative p-5 rounded-xl bg-slate-950/90 border border-slate-800/90 overflow-hidden">
        {/* Subtle background circuit grid texture */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
            backgroundSize: '16px 16px'
          }}
        />

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-5 md:gap-8 lg:gap-12 min-w-0">
          {/* 1. Root Source Node */}
          <div 
            onMouseEnter={() => setHoveredNode('ROOT')}
            onMouseLeave={() => setHoveredNode(null)}
            className={`w-full md:w-60 lg:w-64 p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer relative z-10 shrink-0 ${
              isRootHovered || hoveredNode
                ? isCritical
                  ? 'bg-rose-950/40 border-rose-500/70 ring-2 ring-rose-500/30 shadow-lg shadow-rose-950/50'
                  : 'bg-amber-950/40 border-amber-500/70 ring-2 ring-amber-500/30 shadow-lg shadow-amber-950/50'
                : 'bg-slate-900 border-slate-700/80 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                isCritical 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                Mutated Root File
              </span>
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isCritical ? 'bg-rose-400' : 'bg-amber-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  isCritical ? 'bg-rose-500' : 'bg-amber-500'
                }`} />
              </span>
            </div>

            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`p-2 rounded-lg shrink-0 ${isCritical ? 'bg-rose-950 text-rose-400' : 'bg-amber-950 text-amber-400'}`}>
                <GitCommit className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-mono text-xs font-bold text-white truncate">
                  {rootClass}.java
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  Target AST Method Signature
                </div>
              </div>
            </div>
          </div>

          {/* 2. Middle Signal Connector Bus: Adapts direction on mobile/desktop */}
          <div className="flex md:flex-col items-center justify-center shrink-0 w-full md:w-14 py-1 md:py-0">
            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900 border border-slate-700 text-slate-400 text-xs shadow-inner">
              <ArrowRight className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rotate-90 md:rotate-0 transition-transform duration-300 ${isRootHovered || hoveredNode ? 'text-blue-400' : ''}`} />
            </div>
            <div className="hidden md:block text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-1">
              Cascade
            </div>
          </div>

          {/* 3. Downstream Target Microservices */}
          <div className="w-full flex-1 space-y-2.5 min-w-0">
            <div className="text-[11px] font-mono text-slate-400 font-semibold mb-2 flex items-center justify-between">
              <span>Impacted Downstream Callers ({downstreamCallers.length})</span>
              <span className="text-[10px] text-slate-500">Dependent Services</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 min-w-0">
              {downstreamCallers.map((caller, idx) => {
                const isTargetHovered = hoveredNode === caller;
                const isHighlighted = isRootHovered || isTargetHovered;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredNode(caller)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden min-w-0 ${
                      isHighlighted
                        ? isCritical
                          ? 'bg-rose-950/35 border-rose-500/60 ring-1 ring-rose-500/30 shadow-md'
                          : 'bg-amber-950/35 border-amber-500/60 ring-1 ring-amber-500/30 shadow-md'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Animated directional trace bar on active hover */}
                    {isHighlighted && (
                      <div 
                        className={`absolute left-0 top-0 bottom-0 w-1 ${
                          isCritical ? 'bg-rose-500' : 'bg-amber-500'
                        }`} 
                      />
                    )}

                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <div className="flex items-center gap-2 truncate min-w-0 flex-1">
                        <Server className={`w-3.5 h-3.5 shrink-0 ${
                          isHighlighted
                            ? isCritical ? 'text-rose-400' : 'text-amber-400'
                            : 'text-slate-500'
                        }`} />
                        <span className="font-mono text-xs font-semibold text-slate-200 truncate">
                          {caller}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 shrink-0">
                        Consumer
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
