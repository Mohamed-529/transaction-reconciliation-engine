import React, { useState } from 'react';
import { 
  Server, 
  FileText, 
  GitBranch, 
  User, 
  Clock, 
  ArrowRight, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2,
  Layers,
  Code2
} from 'lucide-react';
import { PrAnalysisRecord, StoryStepState } from '../types';
import { RiskBadgeDisplay } from './RiskBadgeDisplay';
import { TestViewer } from './TestViewer';
import { AnimatedCounter } from './AnimatedCounter';
import { MicroserviceNetworkMap } from './MicroserviceNetworkMap';
import { RefactorProposalCard } from './RefactorProposalCard';

interface Props {
  pr: PrAnalysisRecord;
  onRefactorApplied?: () => void;
  isStoryMode?: boolean;
  storyStep?: StoryStepState;
  onProgrammaticApplyRef?: React.MutableRefObject<(() => void) | null>;
}

export const PrDetailView: React.FC<Props> = ({
  pr,
  onRefactorApplied,
  isStoryMode = false,
  storyStep = 'STORY_IDLE',
  onProgrammaticApplyRef
}) => {
  const [localApplied, setLocalApplied] = useState(pr.isRefactorApplied || false);

  React.useEffect(() => {
    setLocalApplied(pr.isRefactorApplied || false);
  }, [pr.isRefactorApplied]);

  const isCritical = pr.overallRiskBadge === 'CRITICAL' && !localApplied;
  const isHigh = pr.overallRiskBadge === 'HIGH' && !localApplied;
  const isMitigated = localApplied || pr.isRefactorApplied;

  const callersCount = isMitigated ? 0 : (pr.astMetadata.downstreamCallers?.length || 0);
  const isDeepNesting = !isMitigated && pr.astMetadata.maxNestingDepth >= 4;
  const hasHighBlastRadius = !isMitigated && callersCount > 3;

  // Single-sentence high-impact summary
  const getHeroImpactSentence = () => {
    if (isMitigated) {
      return `🛡️ Multi-Agent Refactor Applied: Blast radius completely neutralized via backward-compatible adapter pattern.`;
    }
    if (isCritical) {
      return `⚠️ Modifies core payment logic causing an architectural blast radius across ${callersCount} downstream microservices.`;
    }
    if (isHigh) {
      return `⚠️ Introduces deeply nested control loops (depth ${pr.astMetadata.maxNestingDepth}) inside reconciliation flow, escalating cyclomatic regression risk.`;
    }
    return `✅ Isolated non-breaking code change with zero downstream microservice mutations.`;
  };

  const getHeroBannerGlowClass = () => {
    if (isMitigated) {
      return 'bg-gradient-to-r from-emerald-950/45 via-emerald-950/20 to-slate-900/60 border-emerald-500/50 shadow-emerald-950/40';
    }
    if (isCritical) {
      return 'bg-gradient-to-r from-rose-950/45 via-rose-950/20 to-slate-900/60 ambient-pulse-critical';
    }
    if (isHigh) {
      return 'bg-gradient-to-r from-amber-950/45 via-amber-950/20 to-slate-900/60 ambient-pulse-warning';
    }
    return 'bg-gradient-to-r from-emerald-950/40 via-emerald-950/20 to-slate-900/40 border-emerald-500/30';
  };

  const handleApplySuccess = () => {
    setLocalApplied(true);
    if (onRefactorApplied) {
      onRefactorApplied();
    }
  };

  return (
    <div key={pr.id} className="w-full min-w-0 max-w-4xl space-y-6 sm:space-y-8 pb-12">
      {/* 1. Stagger Step 1: Header & Title Block */}
      <div className="stagger-step-1 space-y-2.5 sm:space-y-3 pb-5 sm:pb-6 border-b border-slate-800/80">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-400 font-mono">
          <span className="font-semibold text-slate-200">PR #{pr.prNumber}</span>
          <span>·</span>
          <span className="truncate max-w-[150px] sm:max-w-none">{pr.author?.name} (@{pr.author?.username})</span>
          <span>·</span>
          <span className="text-slate-400 truncate max-w-[140px] sm:max-w-none">{pr.branch?.target} ← {pr.branch?.source}</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">{pr.repository}</span>
        </div>

        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight break-words">
          {pr.title}
        </h1>
      </div>

      {/* 2. Stagger Step 2: The "At-A-Glance" Hero Banner with Pulse Glow */}
      <div className={`stagger-step-2 p-4 sm:p-6 rounded-2xl border ${getHeroBannerGlowClass()} shadow-xl flex flex-col sm:flex-row items-start sm:items-center gap-3.5 sm:gap-4 transition-all min-w-0`}>
        <div className="shrink-0">
          <RiskBadgeDisplay badge={isMitigated ? 'LOW' : pr.overallRiskBadge} size="lg" />
        </div>
        <div className="flex-1 text-xs sm:text-sm md:text-base font-bold text-white tracking-tight leading-snug break-words">
          {getHeroImpactSentence()}
        </div>
      </div>

      {/* 3. Stagger Step 3: Interactive Multi-Agent Refactoring Negotiation Workspace */}
      {pr.refactorProposal && (
        <div className="stagger-step-3 min-w-0">
          <RefactorProposalCard
            prId={pr.id}
            proposal={pr.refactorProposal}
            isApplied={isMitigated}
            targetFileName={pr.astMetadata.classes?.[0] ? `${pr.astMetadata.classes[0]}.java` : 'PaymentGateway.java'}
            onApplySuccess={handleApplySuccess}
            isStoryMode={isStoryMode}
            storyStep={storyStep}
            onProgrammaticApplyRef={onProgrammaticApplyRef}
          />
        </div>
      )}

      {/* 4. Stagger Step 3: Summary of Changes (when no critical refactor proposal or for context) */}
      <div className="stagger-step-3 bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm min-w-0">
        <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
          <FileText className="w-4 h-4 text-slate-400" />
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
            Summary of Changes
          </h2>
        </div>
        <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed break-words">
          {pr.summary}
        </p>
      </div>

      {/* 5. Stagger Step 4: AST Metrics Visual Impact Cards with Live Counter-Tick Effect */}
      <div
        id="story-step-metrics"
        className={`stagger-step-4 space-y-3 p-3.5 sm:p-4 rounded-2xl transition-all duration-500 min-w-0 ${
          isStoryMode && storyStep === 'STORY_ANALYSIS'
            ? 'border-2 border-blue-500/80 ring-4 ring-blue-500/50 shadow-[0_0_50px_rgba(59,130,246,0.45)] bg-slate-900/60 z-20'
            : ''
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              AST Structural & Architectural Impact
            </h2>
            {isStoryMode && storyStep === 'STORY_ANALYSIS' && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold uppercase animate-pulse">
                Live Analysis In Progress
              </span>
            )}
          </div>
          <span className="text-[11px] sm:text-xs text-slate-500 font-mono">Live AST tokenized counters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {/* Card 1: Impacted Source Files */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 lg:p-6 flex flex-col justify-between shadow-sm min-w-0">
            <div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Impacted Files
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white mt-1.5 sm:mt-2">
                <AnimatedCounter key={`files-${pr.id}-${storyStep}`} target={pr.astMetadata.classes?.length || 1} duration={400} />{' '}
                <span className="text-xs sm:text-sm font-normal text-slate-400">File</span>
              </div>
            </div>
            <div className="mt-3.5 sm:mt-4 pt-3 border-t border-slate-800/80 text-xs font-mono text-slate-400 truncate">
              {pr.astMetadata.classes?.[0] || 'TargetClass'}.java
            </div>
          </div>

          {/* Card 2: Max Nesting Depth */}
          <div className={`rounded-2xl p-4 sm:p-5 lg:p-6 flex flex-col justify-between border shadow-sm transition-all min-w-0 ${
            isDeepNesting 
              ? 'bg-amber-950/25 border-amber-500/40 ring-1 ring-amber-500/30 ambient-pulse-warning' 
              : 'bg-slate-900 border-slate-800'
          }`}>
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Max Nesting Depth
                </span>
                {isDeepNesting ? (
                  <span className="text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase shrink-0">
                    High
                  </span>
                ) : isMitigated ? (
                  <span className="text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold uppercase shrink-0">
                    Flattened
                  </span>
                ) : null}
              </div>
              <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tight mt-1.5 sm:mt-2 ${
                isDeepNesting ? 'text-amber-400' : isMitigated ? 'text-emerald-400' : 'text-white'
              }`}>
                Depth{' '}
                <AnimatedCounter
                  key={`depth-${pr.id}-${storyStep}`}
                  target={isMitigated ? 1 : (isStoryMode && storyStep === 'STORY_ANALYSIS' ? 4 : (pr.astMetadata.maxNestingDepth || 4))}
                  duration={380}
                />
              </div>
            </div>
            <div className="mt-3.5 sm:mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 leading-snug">
              {isMitigated ? 'Flattened to linear pipeline with guard clauses' : isDeepNesting ? 'Cyclomatic branching exceeds threshold' : 'Standard cyclomatic control flow'}
            </div>
          </div>

          {/* Card 3: Downstream Blast Radius */}
          <div className={`sm:col-span-2 lg:col-span-1 rounded-2xl p-4 sm:p-5 lg:p-6 flex flex-col justify-between border shadow-sm transition-all min-w-0 ${
            hasHighBlastRadius || (isStoryMode && storyStep === 'STORY_ANALYSIS')
              ? 'bg-rose-950/25 border-rose-500/40 ring-1 ring-rose-500/30 ambient-pulse-critical' 
              : 'bg-slate-900 border-slate-800'
          }`}>
            <div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Downstream Blast Radius
                </span>
                {hasHighBlastRadius || (isStoryMode && storyStep === 'STORY_ANALYSIS') ? (
                  <span className="text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold uppercase shrink-0">
                    Wide Fan-Out
                  </span>
                ) : isMitigated ? (
                  <span className="text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold uppercase shrink-0">
                    Neutralized
                  </span>
                ) : null}
              </div>
              <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tight mt-1.5 sm:mt-2 ${
                hasHighBlastRadius || (isStoryMode && storyStep === 'STORY_ANALYSIS') ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                <AnimatedCounter
                  key={`callers-${pr.id}-${storyStep}`}
                  target={isMitigated ? 0 : (isStoryMode && storyStep === 'STORY_ANALYSIS' ? 5 : (callersCount || 5))}
                  duration={400}
                />{' '}
                <span className="text-xs sm:text-sm font-normal text-slate-400">Microservices</span>
              </div>
            </div>
            <div className="mt-3.5 sm:mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 leading-snug">
              {isMitigated ? 'All 5 downstream caller ABI contracts preserved' : hasHighBlastRadius ? 'Cross-service regression vector' : 'Isolated to component level'}
            </div>
          </div>
        </div>
      </div>

      {/* 6. Stagger Step 5: Active Microservice Connection Lines (The Map Effect) */}
      <div className="stagger-step-5">
        <MicroserviceNetworkMap
          rootClass={pr.astMetadata.classes?.[0] || 'TargetService'}
          downstreamCallers={pr.astMetadata.downstreamCallers || []}
          isCritical={isCritical}
        />
      </div>

      {/* 7. Stagger Step 5: OpenAI Grounded Test Suite */}
      <div className="stagger-step-5">
        <TestViewer
          testSuite={pr.generatedTestSuite}
          prNumber={pr.prNumber}
          groundingRationale={pr.strategyResults?.[0]?.rationale}
        />
      </div>
    </div>
  );
};
