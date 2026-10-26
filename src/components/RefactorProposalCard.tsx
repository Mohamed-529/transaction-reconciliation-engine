import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  GitMerge, 
  Check, 
  Copy, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { RefactorProposal, StoryStepState } from '../types';
import { TypewriterText } from './TypewriterText';

interface Props {
  prId: string;
  proposal: RefactorProposal;
  isApplied?: boolean;
  targetFileName?: string;
  onApplySuccess?: () => void;
  isStoryMode?: boolean;
  storyStep?: StoryStepState;
  onProgrammaticApplyRef?: React.MutableRefObject<(() => void) | null>;
}

export const RefactorProposalCard: React.FC<Props> = ({
  prId,
  proposal,
  isApplied = false,
  targetFileName = 'PaymentGateway.java',
  onApplySuccess,
  isStoryMode = false,
  storyStep = 'STORY_IDLE',
  onProgrammaticApplyRef
}) => {
  const [isApplying, setIsApplying] = useState(false);
  const [appliedState, setAppliedState] = useState(isApplied || proposal.isApplied || false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    setAppliedState(isApplied || proposal.isApplied || false);
  }, [isApplied, proposal.isApplied]);

  const handleApplyRefactor = React.useCallback(async () => {
    setIsApplying(true);
    try {
      const res = await fetch(`/api/v1/analyses/${prId}/apply-refactor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setAppliedState(true);
        if (onApplySuccess) onApplySuccess();
      }
    } catch (err) {
      console.error('Error applying autonomous refactor:', err);
    } finally {
      setIsApplying(false);
    }
  }, [prId, onApplySuccess]);

  useEffect(() => {
    if (onProgrammaticApplyRef) {
      onProgrammaticApplyRef.current = handleApplyRefactor;
    }
  }, [handleApplyRefactor, onProgrammaticApplyRef]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(proposal.refactoredCodeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const downstreamCount = proposal.mitigatedBlastRadiusServices?.length || 7;
  const isNegotiationSpotlight = isStoryMode && storyStep === 'STORY_NEGOTIATION';
  const isResolutionSpotlight = isStoryMode && storyStep === 'STORY_RESOLVED';

  return (
    <div
      id="story-step-negotiation"
      className={`bg-slate-900 border rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ${
        isNegotiationSpotlight
          ? 'border-blue-500/80 ring-4 ring-blue-500/60 shadow-[0_0_50px_rgba(59,130,246,0.5)] z-20'
          : 'border-slate-800'
      }`}
    >
      {/* 1. At-A-Glance Conflict Banner Header */}
      <div className="bg-gradient-to-r from-rose-950/70 via-slate-900 to-emerald-950/40 border-b border-slate-800 p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 shadow-sm mt-0.5 sm:mt-0">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold shrink-0">
                {proposal.threatSeverity} Architectural Conflict
              </span>
              <span className="text-[11px] sm:text-xs text-slate-400 font-mono truncate max-w-[170px] sm:max-w-none">
                DETECTED IN {targetFileName.toUpperCase()}
              </span>
            </div>
            <h3 className="text-xs sm:text-sm font-semibold text-white tracking-tight mt-1 flex flex-wrap items-center gap-1.5">
              <span>Multi-Agent Refactoring Negotiation Layer</span>
              <span className="text-[11px] sm:text-xs text-slate-400 font-normal">
                (Critic Architect ➔ Patch Developer)
              </span>
            </h3>
          </div>
        </div>

        {/* Copy Patch / Status */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 font-medium transition-colors border border-slate-700/80 cursor-pointer"
            title="Copy refactored code"
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Patch</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Side-by-Side The Conflict Workspace Layout */}
      <div className="p-3.5 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 min-w-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
          {/* Left Side: Threat-Inducing Source Code */}
          <div className="rounded-xl border border-rose-800/40 bg-rose-950/20 p-3.5 sm:p-5 flex flex-col justify-between overflow-hidden shadow-inner relative group min-w-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex flex-wrap items-center justify-between pb-2.5 sm:pb-3 mb-2.5 sm:mb-3 border-b border-rose-800/30 gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
                  <span className="text-xs font-mono font-bold text-rose-400 tracking-wide">
                    🔴 CURRENT THREAT PATTERN
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-900/60 text-rose-300 border border-rose-700/50 uppercase font-semibold">
                  Blocks {downstreamCount} Downstream Callers
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-rose-300/80 mb-2 sm:mb-3 font-mono truncate">
                // Mutates signature directly | Breaks binary ABI compatibility
              </p>
              <pre className="font-mono text-[11px] sm:text-xs text-rose-200/95 leading-relaxed overflow-x-auto p-3 sm:p-3.5 bg-slate-950/90 rounded-lg border border-rose-900/50 max-h-80 shadow-sm max-w-full">
                <code>{proposal.originalBreakingSnippet}</code>
              </pre>
            </div>
            <div className="mt-3.5 sm:mt-4 pt-2.5 sm:pt-3 border-t border-rose-800/30 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] sm:text-[11px] text-rose-300/80 font-mono gap-1">
              <span className="truncate">Failure Vector: NoSuchMethodError at runtime</span>
              <span className="text-rose-400 font-semibold shrink-0">{downstreamCount} Dependent Services</span>
            </div>
          </div>

          {/* Right Side: Negotiated Alternate Refactor */}
          <div className={`rounded-xl border p-3.5 sm:p-5 flex flex-col justify-between overflow-hidden shadow-inner transition-all duration-300 relative group min-w-0 ${
            appliedState
              ? 'border-emerald-500/60 bg-emerald-950/35 ring-2 ring-emerald-500/30'
              : 'border-emerald-800/40 bg-emerald-950/20'
          }`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex flex-wrap items-center justify-between pb-2.5 sm:pb-3 mb-2.5 sm:mb-3 border-b border-emerald-800/30 gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500/50" />
                  <span className="text-xs font-mono font-bold text-emerald-400 tracking-wide">
                    🟢 NEGOTIATED REFACTOR
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 uppercase font-semibold">
                  Zero Downstream Blast Radius
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-emerald-300/80 mb-2 sm:mb-3 font-mono truncate">
                // Preserves legacy signature | Safe overload forwarding adapter
              </p>
              <pre className="font-mono text-[11px] sm:text-xs text-emerald-100 leading-relaxed overflow-x-auto p-3 sm:p-3.5 bg-slate-950/90 rounded-lg border border-emerald-900/50 max-h-80 shadow-sm max-w-full">
                <code>{proposal.refactoredCodeSnippet}</code>
              </pre>
            </div>
            <div className="mt-3.5 sm:mt-4 pt-2.5 sm:pt-3 border-t border-emerald-800/30 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] sm:text-[11px] text-emerald-300/90 font-mono gap-1">
              <span className="truncate">Pattern: {proposal.backwardCompatibilityStrategy}</span>
              {appliedState ? (
                <span className="font-bold text-emerald-400 flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" /> ACTIVE IN BRANCH
                </span>
              ) : (
                <span className="text-emerald-400/80 shrink-0">ABI Preserved</span>
              )}
            </div>
          </div>
        </div>

        {/* 3. Agent 1 Architect Critique Summary & Action Anchor Bar */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 min-w-0">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
              <ShieldAlert className="w-4 h-4 text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5 flex-wrap">
                <span>Architect Critique</span>
                <span className="text-[10px] text-slate-500 font-normal">| Structural Impact Assessment</span>
              </h4>
              <div className="text-xs text-slate-300 mt-1 leading-relaxed font-sans break-words">
                {isNegotiationSpotlight ? (
                  <TypewriterText
                    text={`ABI Binary Compatibility Break Predicted in OrderProcessingService: ${proposal.criticRationale}`}
                    speed={12}
                    isActive={true}
                  />
                ) : (
                  proposal.criticRationale
                )}
              </div>
            </div>
          </div>

          {/* Action Anchor: Prominent "Apply Autonomous Refactor" with Spotlight Ring */}
          <div id="story-step-resolution" className="w-full sm:w-auto shrink-0 relative flex justify-end">
            {isResolutionSpotlight && !appliedState && (
              <span className="absolute -inset-2.5 rounded-2xl bg-emerald-500/35 blur-md animate-pulse pointer-events-none" />
            )}
            {appliedState ? (
              <div className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold shadow-lg shadow-emerald-950/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">Autonomous Patch Applied to Workspace</span>
              </div>
            ) : (
              <button
                onClick={handleApplyRefactor}
                disabled={isApplying}
                className={`w-full sm:w-auto group relative flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transform active:scale-95 hover:scale-105 transition-all duration-300 cursor-pointer disabled:opacity-50 ${
                  isResolutionSpotlight
                    ? 'bg-emerald-400 text-slate-950 ring-4 ring-emerald-400/90 shadow-[0_0_45px_rgba(16,185,129,0.9)] scale-105 spotlight-active-emerald'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                }`}
              >
                <GitMerge className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform shrink-0" />
                <span>{isApplying ? 'Applying Patch...' : 'Apply Autonomous Refactor'}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
