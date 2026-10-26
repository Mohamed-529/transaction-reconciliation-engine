import React, { useState, useEffect, useRef } from 'react';
import { 
  GitPullRequest, 
  Server, 
  Plus, 
  Layers, 
  GitBranch, 
  Search, 
  Clock, 
  User, 
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Play,
  Film,
  Sparkles,
  Menu,
  X,
  ChevronLeft
} from 'lucide-react';
import { PrAnalysisRecord, KafkaTopicStats, RedisIdempotencyLock, RiskBadgeType, StoryStepState } from './types';
import { RiskBadgeDisplay } from './components/RiskBadgeDisplay';
import { TestViewer } from './components/TestViewer';
import { InfrastructureView } from './components/InfrastructureView';
import { SimulateModal } from './components/SimulateModal';
import { PrDetailView } from './components/PrDetailView';
import { SystemStoryDirector } from './components/SystemStoryDirector';

export default function App() {
  const [activeTab, setActiveTab] = useState<'prs' | 'infra'>('prs');
  const [analyses, setAnalyses] = useState<PrAnalysisRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'high' | 'low'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storyStep, setStoryStep] = useState<StoryStepState>('STORY_IDLE');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [mobilePrView, setMobilePrView] = useState<'list' | 'detail'>('list');
  const programmaticApplyRef = useRef<(() => void) | null>(null);

  const [kafkaStats, setKafkaStats] = useState<KafkaTopicStats>({
    topic: 'pr-analysis-events',
    partition: 0,
    totalMessagesPublished: 3,
    totalMessagesConsumed: 3,
    lag: 0,
    consumerGroup: 'pr-risk-analysis-group'
  });
  const [redisLocks, setRedisLocks] = useState<RedisIdempotencyLock[]>([]);

  const fetchSystemData = async () => {
    try {
      const [resAnalyses, resStatus] = await Promise.all([
        fetch('/api/v1/analyses'),
        fetch('/api/v1/system/status')
      ]);
      if (resAnalyses.ok) {
        const data: PrAnalysisRecord[] = await resAnalyses.json();
        setAnalyses(data);
        if (data.length > 0 && !selectedId) {
          setSelectedId(data[0].id);
        }
      }
      if (resStatus.ok) {
        const status = await resStatus.json();
        setKafkaStats(status.kafka);
        setRedisLocks(status.redis);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchSystemData();

    // Setup Server-Sent Events (SSE) for background live updates
    const eventSource = new EventSource('/api/v1/events/stream');

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'ANALYSIS_COMPLETED' || payload.type === 'NEW_ANALYSIS') {
          fetchSystemData();
          if (payload.analysis) {
            setSelectedId(payload.analysis.id);
          }
        } else if (payload.type === 'STATUS_UPDATE') {
          setKafkaStats(payload.kafka);
          setRedisLocks(payload.redis);
        }
      } catch (e) {
        console.error('SSE parse error:', e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleTriggerWebhook = async (presetKey: string) => {
    setIsSubmitting(true);
    try {
      await fetch('/api/v1/webhooks/github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-GitHub-Delivery': `deliv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          'X-GitHub-Event': 'pull_request'
        },
        body: JSON.stringify({ presetKey })
      });
      setTimeout(fetchSystemData, 500);
    } catch (err) {
      console.error('Webhook dispatch error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTriggerBurst = async () => {
    setIsSubmitting(true);
    try {
      await fetch('/api/v1/simulate/burst', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryId: `burst-${Date.now()}` })
      });
      setTimeout(fetchSystemData, 500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRelativeTime = (isoString: string) => {
    const diffSeconds = Math.max(0, Math.floor((Date.now() - new Date(isoString).getTime()) / 1000));
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h ago`;
  };

  const filteredAnalyses = analyses.filter((pr) => {
    const matchesSearch = 
      pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pr.author?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(pr.prNumber).includes(searchQuery);

    if (!matchesSearch) return false;

    if (filter === 'high') {
      return pr.overallRiskBadge === 'CRITICAL' || pr.overallRiskBadge === 'HIGH';
    }
    if (filter === 'low') {
      return pr.overallRiskBadge === 'LOW' || pr.overallRiskBadge === 'MEDIUM';
    }
    return true;
  });

  const selectedPr = analyses.find((a) => a.id === selectedId) || analyses[0];

  useEffect(() => {
    if (storyStep !== 'STORY_IDLE') {
      setActiveTab('prs');
      setMobilePrView('detail');
    }
  }, [storyStep]);

  const handleSelectPr = (id: string) => {
    setSelectedId(id);
    setMobilePrView('detail');
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 antialiased overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* 1. Mobile Sliding Navigation Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileNavOpen(false)}
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Sidebar */}
          <aside className="relative w-72 max-w-[85vw] h-full bg-slate-900 border-r border-slate-800 flex flex-col justify-between shadow-2xl p-5 z-50 animate-in slide-in-from-left duration-200">
            <div>
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h1 className="text-sm font-semibold tracking-tight text-white">Risk Analyzer</h1>
                    <p className="text-[11px] text-slate-400">Engineering Quality Engine</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileNavOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links inside drawer */}
              <nav className="mt-5 space-y-1.5">
                <button
                  onClick={() => {
                    setActiveTab('prs');
                    setIsMobileNavOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === 'prs'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <GitPullRequest className="w-4 h-4" />
                    <span>Pull Requests</span>
                  </div>
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 font-mono">
                    {analyses.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('infra');
                    setIsMobileNavOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === 'infra'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <Server className="w-4 h-4" />
                  <span>Infrastructure</span>
                </button>
              </nav>
            </div>

            {/* Health status inside drawer */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 mt-auto">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-300 font-medium text-[11px]">System Operational</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Kafka + Redis</span>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* 2. Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-slate-800 bg-slate-900/60 flex-col justify-between shrink-0">
        <div className="p-5">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-2.5 pb-6 border-b border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-white">Risk Analyzer</h1>
              <p className="text-[11px] text-slate-400">Engineering Quality Engine</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-5 space-y-1">
            <button
              onClick={() => setActiveTab('prs')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'prs'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <GitPullRequest className="w-4 h-4" />
                <span>Pull Requests</span>
              </div>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 font-mono">
                {analyses.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('infra')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'infra'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Server className="w-4 h-4" />
              <span>Infrastructure</span>
            </button>
          </nav>
        </div>

        {/* System Health Status Indicator */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-300 font-medium text-[11px]">System Operational</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Kafka + Redis</span>
          </div>
        </div>
      </aside>

      {/* 3. Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 border-b border-slate-800 bg-slate-900/40 px-3 sm:px-6 flex items-center justify-between shrink-0 gap-2">
          {/* Left: Mobile Drawer Trigger + Breadcrumbs */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title="Open Navigation"
              aria-label="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-400 font-medium min-w-0">
              <span className="hidden sm:inline">Engineering</span>
              <span className="hidden sm:inline">/</span>
              {activeTab === 'prs' ? (
                <>
                  <span className="text-slate-200 truncate">Pull Requests</span>
                  {selectedPr && (
                    <>
                      <span>/</span>
                      <span className="text-slate-200 font-mono truncate max-w-[80px] xs:max-w-[120px] sm:max-w-xs">
                        PR #{selectedPr.prNumber}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <span className="text-slate-200 truncate">Infrastructure & Telemetry</span>
              )}
            </div>
          </div>

          {/* Right: Primary Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Play System Story Button with Active Particle Pulse Effect */}
            <div className="relative group">
              <span className="absolute -inset-1 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 opacity-75 blur-sm particle-pulse-ring pointer-events-none" />
              <button
                onClick={() => {
                  setActiveTab('prs');
                  setMobilePrView('detail');
                  setStoryStep('STORY_INGESTION');
                }}
                className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-md shadow-indigo-950/50 transition-all cursor-pointer border border-blue-400/40 transform hover:scale-[1.02] active:scale-98"
              >
                <Play className="w-3.5 h-3.5 fill-white text-white shrink-0" />
                <span className="hidden sm:inline">Play System Story</span>
                <span className="sm:hidden font-semibold">Story</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/20 text-blue-100 font-bold tracking-wider hidden xs:inline">
                  Tour
                </span>
              </button>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Simulate Inbound PR</span>
              <span className="sm:hidden">Simulate</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        {activeTab === 'prs' ? (
          <div className="flex-1 flex min-w-0 overflow-hidden">
            {/* Primary Column: Pull Request Queue */}
            <div className={`w-full md:w-80 lg:w-96 border-r border-slate-800 flex-col bg-slate-950/50 shrink-0 ${
              mobilePrView === 'detail' ? 'hidden md:flex' : 'flex'
            }`}>
              {/* Search & Filter Header */}
              <div className="p-3 sm:p-4 border-b border-slate-800 space-y-2.5 sm:space-y-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter by title, author, or #..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-700"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg text-xs">
                  <button
                    onClick={() => setFilter('all')}
                    className={`flex-1 py-1 rounded font-medium transition-colors cursor-pointer text-center ${
                      filter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('high')}
                    className={`flex-1 py-1 rounded font-medium transition-colors cursor-pointer text-center ${
                      filter === 'high' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Critical & High
                  </button>
                  <button
                    onClick={() => setFilter('low')}
                    className={`flex-1 py-1 rounded font-medium transition-colors cursor-pointer text-center ${
                      filter === 'low' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Low
                  </button>
                </div>
              </div>

              {/* PR List Items */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-850">
                {filteredAnalyses.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 italic">
                    No pull requests match the current filter.
                  </div>
                ) : (
                  filteredAnalyses.map((pr) => {
                    const isSelected = selectedPr && selectedPr.id === pr.id;
                    return (
                      <button
                        key={pr.id}
                        onClick={() => handleSelectPr(pr.id)}
                        className={`w-full text-left p-3.5 sm:p-4 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white'
                            : 'hover:bg-slate-900/40 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-mono text-xs font-semibold text-slate-400">
                            #{pr.prNumber}
                          </span>
                          <RiskBadgeDisplay badge={pr.overallRiskBadge} size="sm" />
                        </div>

                        <div className="font-medium text-xs text-white line-clamp-1 mb-2">
                          {pr.title}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                            <User className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="truncate">{pr.author?.name || 'Engineer'}</span>
                          </div>
                          <span className="shrink-0 text-slate-500 tabular-nums font-mono text-[10px]">
                            {formatRelativeTime(pr.receivedAt)}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Detail View Pane */}
            <div className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 xl:p-10 ${
              mobilePrView === 'list' ? 'hidden md:block' : 'block'
            }`}>
              {/* Mobile Back Navigation Bar */}
              <div className="md:hidden flex items-center justify-between pb-3.5 mb-5 border-b border-slate-800">
                <button
                  onClick={() => setMobilePrView('list')}
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold py-1.5 px-3 rounded-lg bg-blue-950/40 border border-blue-900/60 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Pull Requests Queue</span>
                </button>
                {selectedPr && (
                  <span className="text-xs font-mono text-slate-400">
                    PR #{selectedPr.prNumber}
                  </span>
                )}
              </div>

              {selectedPr ? (
                <PrDetailView
                  pr={selectedPr}
                  onRefactorApplied={fetchSystemData}
                  isStoryMode={storyStep !== 'STORY_IDLE'}
                  storyStep={storyStep}
                  onProgrammaticApplyRef={programmaticApplyRef}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                  Select a pull request from the queue to view its risk assessment.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* 3. Dedicated Infrastructure & Telemetry View */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <InfrastructureView
              kafkaStats={kafkaStats}
              redisLocks={redisLocks}
              onRefresh={fetchSystemData}
              onTriggerBurst={handleTriggerBurst}
              isSubmitting={isSubmitting}
            />
          </div>
        )}
      </div>

      {/* 4. Inbound PR Simulation Modal */}
      <SimulateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTriggerWebhook={handleTriggerWebhook}
        isSubmitting={isSubmitting}
      />

      {/* 5. System Story Director */}
      <SystemStoryDirector
        storyStep={storyStep}
        onSetStoryStep={setStoryStep}
        onSelectPrId={setSelectedId}
        analyses={analyses}
        onRefreshData={fetchSystemData}
        onProgrammaticApplyRef={programmaticApplyRef}
        onSetActiveTab={setActiveTab}
      />
    </div>
  );
}
