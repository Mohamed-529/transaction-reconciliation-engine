import React, { useEffect, useState, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  X, 
  Sparkles, 
  Film, 
  CheckCircle2, 
  AlertTriangle, 
  GitPullRequest, 
  Server, 
  Cpu, 
  Bot, 
  ArrowRight,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { StoryStepState, PrAnalysisRecord } from '../types';

interface Props {
  storyStep: StoryStepState;
  onSetStoryStep: (step: StoryStepState) => void;
  onSelectPrId: (id: string) => void;
  analyses: PrAnalysisRecord[];
  onRefreshData: () => Promise<void>;
  onProgrammaticApplyRef?: React.MutableRefObject<(() => void) | null>;
  onSetActiveTab: (tab: 'prs' | 'infra') => void;
}

export const SystemStoryDirector: React.FC<Props> = ({
  storyStep,
  onSetStoryStep,
  onSelectPrId,
  analyses,
  onRefreshData,
  onProgrammaticApplyRef,
  onSetActiveTab
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; size: number }>>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const showToast = (msg: string, durationMs = 4000) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, durationMs);
  };

  // Trigger celebration particle effect
  const triggerCelebration = () => {
    const colors = ['#10b981', '#3b82f6', '#06b6d4', '#6366f1', '#34d399'];
    const newParticles = Array.from({ length: 36 }).map((_, i) => ({
      id: i,
      x: Math.random() * 90 + 5,
      y: Math.random() * 80 + 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.floor(Math.random() * 8) + 6
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 3500);
  };

  // Step 1: Ingestion sequence
  const executeStepIngestion = async () => {
    onSetActiveTab('prs');
    showToast('🚨 Incoming Pull Request #104 Detected... Pushing to Kafka.');

    // Programmatically reset PR #104 on server to ensure pristine critical baseline
    try {
      await fetch('/api/v1/story/reset-pr104', { method: 'POST' });
      await onRefreshData();
    } catch (e) {
      console.warn('Story reset hook:', e);
    }

    // Scroll to top of list
    const firstPr = analyses.find((p) => p.prNumber === 104) || analyses[0];
    if (firstPr) {
      onSelectPrId(firstPr.id);
    }

    if (isPlaying) {
      timerRef.current = setTimeout(() => {
        onSetStoryStep('STORY_ANALYSIS');
      }, 4200);
    }
  };

  // Step 2: AST Analysis sequence
  const executeStepAnalysis = () => {
    showToast('⚡ JavaParser AST Engine: Scanning syntax tree... Blast Radius Fan-Out detected!');
    
    // Smoothly scroll focus panel to AST Metrics section
    setTimeout(() => {
      const el = document.getElementById('story-step-metrics');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 400);

    if (isPlaying) {
      timerRef.current = setTimeout(() => {
        onSetStoryStep('STORY_NEGOTIATION');
      }, 5000);
    }
  };

  // Step 3: Multi-Agent Negotiation sequence
  const executeStepNegotiation = () => {
    showToast('🤖 Multi-Agent Engine Active: Critic Architect debating Patch Developer...');
    
    setTimeout(() => {
      const el = document.getElementById('story-step-negotiation');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);

    if (isPlaying) {
      timerRef.current = setTimeout(() => {
        onSetStoryStep('STORY_RESOLVED');
      }, 6500);
    }
  };

  // Step 4: Autonomous Resolution sequence
  const executeStepResolution = () => {
    showToast('🛡️ Autonomous Patch Ready: Preserves backward ABI compatibility across all 5 callers.');
    
    setTimeout(() => {
      const el = document.getElementById('story-step-resolution');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);

    // Pause for 1.5 seconds, then trigger simulated click action!
    timerRef.current = setTimeout(() => {
      if (onProgrammaticApplyRef?.current) {
        onProgrammaticApplyRef.current();
      }
      triggerCelebration();
      showToast('🎉 Autonomous Refactor Applied! 100% Binary ABI Compatibility Restored (0 Blast Radius).', 6000);

      setTimeout(() => {
        setShowCompletionModal(true);
      }, 1200);
    }, 1500);
  };

  useEffect(() => {
    clearTimer();

    if (storyStep === 'STORY_INGESTION') {
      executeStepIngestion();
    } else if (storyStep === 'STORY_ANALYSIS') {
      executeStepAnalysis();
    } else if (storyStep === 'STORY_NEGOTIATION') {
      executeStepNegotiation();
    } else if (storyStep === 'STORY_RESOLVED') {
      executeStepResolution();
    }

    return () => clearTimer();
  }, [storyStep]);

  if (storyStep === 'STORY_IDLE' && !toastMessage && !showCompletionModal) {
    return null;
  }

  const stepsMeta = [
    { key: 'STORY_INGESTION', label: '1. Ingestion & Kafka', subtitle: 'Simulating GitHub webhook push for PR #104 into Kafka Partition 0' },
    { key: 'STORY_ANALYSIS', label: '2. AST Blast Radius', subtitle: 'JavaParser calculates 5 dependent microservices and cyclomatic complexity' },
    { key: 'STORY_NEGOTIATION', label: '3. Multi-Agent Debate', subtitle: 'Critic Architect flags ABI break; Patch Developer synthesizes adapter' },
    { key: 'STORY_RESOLVED', label: '4. Autonomous Patch', subtitle: 'Automated 1-click hotpatch deployment restoring backward binary compatibility' }
  ];

  const currentStepIndex = stepsMeta.findIndex((s) => s.key === storyStep);
  const activeMeta = stepsMeta[currentStepIndex] || stepsMeta[0];

  const handleNext = () => {
    clearTimer();
    if (storyStep === 'STORY_INGESTION') onSetStoryStep('STORY_ANALYSIS');
    else if (storyStep === 'STORY_ANALYSIS') onSetStoryStep('STORY_NEGOTIATION');
    else if (storyStep === 'STORY_NEGOTIATION') onSetStoryStep('STORY_RESOLVED');
    else if (storyStep === 'STORY_RESOLVED') setShowCompletionModal(true);
  };

  const handlePrev = () => {
    clearTimer();
    if (storyStep === 'STORY_RESOLVED') onSetStoryStep('STORY_NEGOTIATION');
    else if (storyStep === 'STORY_NEGOTIATION') onSetStoryStep('STORY_ANALYSIS');
    else if (storyStep === 'STORY_ANALYSIS') onSetStoryStep('STORY_INGESTION');
  };

  const handleSkip = () => {
    clearTimer();
    onSetStoryStep('STORY_IDLE');
    setShowCompletionModal(false);
  };

  const handleReplay = async () => {
    setShowCompletionModal(false);
    clearTimer();
    try {
      await fetch('/api/v1/story/reset-pr104', { method: 'POST' });
      await onRefreshData();
    } catch {}
    onSetStoryStep('STORY_INGESTION');
  };

  return (
    <>
      {/* 1. Backdrop Spotlight Blur Overlay when Story is Active */}
      {storyStep !== 'STORY_IDLE' && (
        <div className="fixed inset-0 pointer-events-none z-30 transition-opacity duration-500">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" />
        </div>
      )}

      {/* 2. Celebration Particle Confetti */}
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full animate-ping"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                backgroundColor: p.color,
                width: `${p.size}px`,
                height: `${p.size}px`,
                opacity: 0.85
              }}
            />
          ))}
        </div>
      )}

      {/* 3. Floating Story Controller Banner at the Top of Screen */}
      {storyStep !== 'STORY_IDLE' && (
        <div className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-2xl transition-all duration-300">
          <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-2.5 sm:p-3.5 backdrop-blur-md flex flex-col gap-2 sm:gap-2.5">
            {/* Top Bar: Progress and Action Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span className="flex h-2.5 w-2.5 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
                </span>
                <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1 truncate">
                  <Film className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">Story Mode</span>
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-[11px] sm:text-xs font-mono font-semibold text-slate-300 shrink-0">
                  Step {currentStepIndex + 1}/4
                </span>
              </div>

              {/* Player Controls */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handlePrev}
                  disabled={currentStepIndex === 0}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-800 transition-colors text-[11px] sm:text-xs font-medium cursor-pointer"
                  title="Previous Step"
                >
                  Prev
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors text-[11px] sm:text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-sm"
                  title={isPlaying ? 'Pause Auto-Advance' : 'Resume Auto-Advance'}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>Play</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentStepIndex === 3}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-800 transition-colors text-[11px] sm:text-xs font-medium cursor-pointer"
                  title="Next Step"
                >
                  Next
                </button>

                <button
                  onClick={handleSkip}
                  className="px-2 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-[11px] sm:text-xs font-medium flex items-center gap-1 cursor-pointer ml-0.5 sm:ml-1"
                  title="Skip Tour"
                >
                  <X className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Skip</span>
                </button>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 pt-1 border-t border-slate-800/80">
              {stepsMeta.map((s, idx) => {
                const isActive = idx === currentStepIndex;
                const isPassed = idx < currentStepIndex;
                return (
                  <div key={s.key} className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isPassed ? 'w-full bg-blue-500' : isActive ? 'w-full bg-emerald-400 animate-pulse' : 'w-0'
                        }`}
                      />
                    </div>
                    <span className={`text-[9px] sm:text-[10px] font-mono truncate ${isActive ? 'text-blue-300 font-bold' : isPassed ? 'text-slate-400' : 'text-slate-600'}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Narrative Subtitle Explainer */}
            <div className="bg-slate-950/80 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 border border-slate-800 text-[11px] sm:text-xs text-slate-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="leading-snug break-words">{activeMeta.subtitle}</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Dynamic Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900 border border-blue-500/50 shadow-2xl shadow-blue-950/60 rounded-xl p-3.5 sm:p-4 flex items-center gap-3 backdrop-blur-md">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div className="text-xs text-slate-200 font-medium leading-relaxed break-words">
              {toastMessage}
            </div>
          </div>
        </div>
      )}

      {/* 5. Ingestion Isolated Focus Modal for Step 1 */}
      {storyStep === 'STORY_INGESTION' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-4 pointer-events-none">
          <div className="bg-slate-900/95 border-2 border-blue-500/80 rounded-2xl p-4 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-[0_0_60px_rgba(59,130,246,0.4)] pointer-events-auto animate-in zoom-in-95 duration-200 space-y-3.5 sm:space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold shrink-0">
                  !
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-white truncate">Webhook Simulator Triggered</h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono truncate">X-GitHub-Delivery: deliv-story-104</p>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold shrink-0">
                CRITICAL THREAT
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 font-mono">
                <div className="text-slate-400 text-[10px] sm:text-[11px]">Pull Request #104:</div>
                <div className="text-white font-semibold text-xs sm:text-sm break-words">
                  Refactor PaymentGateway authorization signature with multi-currency tokens
                </div>
                <div className="text-slate-500 text-[10px] break-words">
                  Author: Sarah Chen (@sarah-core) · Branch: feat/multi-currency-token → main
                </div>
              </div>

              <div className="flex flex-col xs:flex-row xs:items-center justify-between p-3 bg-blue-950/30 rounded-xl border border-blue-900/40 text-[11px] gap-1">
                <div className="flex items-center gap-2 text-blue-300">
                  <Server className="w-3.5 h-3.5 shrink-0" />
                  <span>Routing to Kafka Event Broker</span>
                </div>
                <span className="font-mono text-blue-400">Partition 0 · Offset 104</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col xs:flex-row xs:items-center justify-between gap-3 text-xs">
              <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                Dispatching to Consumer Pipeline...
              </span>
              <button
                onClick={() => onSetStoryStep('STORY_ANALYSIS')}
                className="w-full xs:w-auto px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer text-center"
              >
                Inspect AST Analysis ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Story Complete Celebration Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl text-center space-y-5 sm:space-y-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400" />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <div className="text-[11px] sm:text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                System Story Concluded
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Autonomous Refactor Successful
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                The Multi-Agent Engine analyzed the AST signature break, negotiated a backward-compatible adapter pattern, and applied a zero-blast-radius patch in real time.
              </p>
            </div>

            {/* Key Metrics Summary */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 bg-slate-950/80 rounded-xl sm:rounded-2xl border border-slate-800 text-left font-mono">
              <div className="min-w-0">
                <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase truncate">Blast Radius</div>
                <div className="text-sm sm:text-lg font-bold text-emerald-400 truncate">0 Services</div>
                <div className="text-[9px] sm:text-[10px] text-slate-400 truncate">Neutralized</div>
              </div>
              <div className="min-w-0">
                <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase truncate">ABI Compat</div>
                <div className="text-sm sm:text-lg font-bold text-emerald-400 truncate">100%</div>
                <div className="text-[9px] sm:text-[10px] text-slate-400 truncate">Preserved</div>
              </div>
              <div className="min-w-0">
                <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase truncate">Risk Level</div>
                <div className="text-sm sm:text-lg font-bold text-emerald-400 truncate">LOW</div>
                <div className="text-[9px] sm:text-[10px] text-slate-400 truncate">Merge Ready</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-2">
              <button
                onClick={handleReplay}
                className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer border border-slate-700 flex-1 sm:flex-initial"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span>Replay Story</span>
              </button>
              <button
                onClick={handleSkip}
                className="flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer flex-1 sm:flex-initial"
              >
                <span>Explore Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
