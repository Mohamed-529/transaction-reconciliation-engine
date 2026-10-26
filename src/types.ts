export type RiskBadgeType = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type StoryStepState = 
  | 'STORY_IDLE'
  | 'STORY_INGESTION'
  | 'STORY_ANALYSIS'
  | 'STORY_NEGOTIATION'
  | 'STORY_RESOLVED';

export interface StrategyResult {
  strategyName: string;
  calculatedScore: number;
  riskLevel: RiskBadgeType;
  rationale: string;
  flaggedFactors: string[];
}

export interface AstAnalysis {
  classes: string[];
  modifiedMethodsCount: number;
  methodSignatures: string[];
  maxNestingDepth: number;
  isCoreServiceModified: boolean;
  downstreamCallers: string[];
  linesAdded: number;
  linesDeleted: number;
}

export interface PrAuthor {
  name: string;
  username: string;
  avatarUrl?: string;
}

export interface PrBranch {
  source: string;
  target: string;
}

export interface RefactorProposal {
  criticRationale: string;
  threatSeverity: string;
  originalBreakingSnippet: string;
  refactoredCodeSnippet: string;
  backwardCompatibilityStrategy: string;
  mitigatedBlastRadiusServices: string[];
  negotiatedAt: string;
  isApplied?: boolean;
}

export interface PrAnalysisRecord {
  id: string;
  deliveryId: string;
  repository: string;
  prNumber: number;
  title: string;
  author: PrAuthor;
  branch: PrBranch;
  summary: string;
  action: string;
  headSha: string;
  baseSha: string;
  overallRiskBadge: RiskBadgeType;
  complexityScore: number;
  blastRadiusScore: number;
  strategyResults: StrategyResult[];
  astMetadata: AstAnalysis;
  rawDiff: string;
  generatedTestSuite: string;
  receivedAt: string;
  status: 'QUEUED' | 'ANALYZING' | 'GROUNDING_AI' | 'COMPLETED';
  refactorProposal?: RefactorProposal;
  isRefactorApplied?: boolean;
}

export interface KafkaTopicStats {
  topic: string;
  partition: number;
  totalMessagesPublished: number;
  totalMessagesConsumed: number;
  lag: number;
  consumerGroup: string;
}

export interface RedisIdempotencyLock {
  key: string;
  deliveryId: string;
  ttlRemainingSeconds: number;
  status: string;
  timestamp: string;
}
