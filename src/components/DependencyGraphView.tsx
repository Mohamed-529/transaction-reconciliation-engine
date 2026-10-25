import React from 'react';
import { GitBranch, Layers, ArrowRight, ShieldCheck, Flame } from 'lucide-react';
import { AstAnalysis } from '../types';

interface Props {
  astMetadata: AstAnalysis;
}

export const DependencyGraphView: React.FC<Props> = ({ astMetadata }) => {
  const modifiedClasses = astMetadata.classes || ['UnknownClass'];
  const downstream = astMetadata.downstreamCallers || [];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-inner">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-slate-200">AST Blast Radius & Dependency Call Graph</h3>
        </div>
        <div className="text-xs text-slate-400">
          Computed via <span className="text-indigo-400 font-mono">JavaParser Symbol Solver</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Directly Modified Source Classes */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-300">
              Directly Mutated Classes ({modifiedClasses.length})
            </h4>
          </div>
          <div className="space-y-2">
            {modifiedClasses.map((cls, idx) => (
              <div key={idx} className="flex items-center justify-between bg-blue-950/30 border border-blue-900/50 rounded px-3 py-2 text-sm text-blue-200">
                <span className="font-mono font-medium">{cls}.java</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  Target AST Root
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 space-y-1 font-mono">
            <div>• Max AST Nesting Depth: <span className="text-amber-400 font-bold">{astMetadata.maxNestingDepth}</span></div>
            <div>• Signatures Changed: <span className="text-sky-400 font-bold">{astMetadata.modifiedMethodsCount}</span></div>
            <div>• Lines Changed: <span className="text-emerald-400 font-bold">+{astMetadata.linesAdded}</span> / <span className="text-rose-400 font-bold">-{astMetadata.linesDeleted}</span></div>
          </div>
        </div>

        {/* Downstream Impact / Blast Radius */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              <h4 className="text-xs uppercase tracking-wider font-bold text-slate-300">
                Downstream Impacted Callers ({downstream.length})
              </h4>
            </div>
            {downstream.length > 5 ? (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                HIGH BLAST RADIUS
              </span>
            ) : (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                CONTROLLED RADIUS
              </span>
            )}
          </div>

          {downstream.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-xs italic">
              No downstream caller dependencies detected in graph. Isolated change.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {downstream.map((caller, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-rose-400" />
                    <span className="font-mono">{caller}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                    Downstream Caller
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Regression Propagation Risk:</span>
            <span className={downstream.length > 5 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
              {downstream.length > 5 ? 'Elevated (Multi-service impact)' : 'Low (Component isolated)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
