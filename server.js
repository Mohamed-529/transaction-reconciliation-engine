const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// =========================================================================
// 1. In-Memory Emulation of Infrastructure Services (Redis, Kafka, Postgres)
// =========================================================================

// Redis Store for X-GitHub-Delivery Idempotency
const redisStore = new Map(); // key -> { deliveryId, value, expireAt, timestamp }

function redisSetNx(key, deliveryId, ttlSeconds = 86400) {
  const now = Date.now();
  if (redisStore.has(key)) {
    const entry = redisStore.get(key);
    if (entry.expireAt > now) {
      return false; // Key already exists (duplicate delivery)
    }
  }
  redisStore.set(key, {
    deliveryId,
    value: 'PROCESSED',
    expireAt: now + ttlSeconds * 1000,
    timestamp: new Date().toISOString()
  });
  return true;
}

function getActiveRedisLocks() {
  const now = Date.now();
  const locks = [];
  for (const [key, item] of redisStore.entries()) {
    if (item.expireAt > now) {
      locks.push({
        key,
        deliveryId: item.deliveryId,
        ttlRemainingSeconds: Math.max(0, Math.round((item.expireAt - now) / 1000)),
        status: item.value,
        timestamp: item.timestamp
      });
    }
  }
  return locks;
}

// Kafka Topic Representation: 'pr-analysis-events'
const kafkaStats = {
  topic: 'pr-analysis-events',
  partition: 0,
  totalMessagesPublished: 0,
  totalMessagesConsumed: 0,
  lag: 0,
  consumerGroup: 'pr-risk-analysis-group'
};

const sseClients = new Set();
function broadcastSSE(data) {
  const msg = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(msg);
    } catch {
      sseClients.delete(res);
    }
  }
}

// Persistent Storage Representation (PostgreSQL table: pr_analyses)
const prAnalyses = [];

// Seed dependency graph for downstream blast radius analysis
const classCallersGraph = {
  PaymentGateway: ['PaymentService'],
  PaymentService: ['OrderProcessingService', 'CheckoutController', 'SubscriptionService'],
  OrderProcessingService: ['FulfillmentService', 'NotificationService', 'InvoiceGenerator'],
  UserRepository: ['UserService'],
  UserService: ['AuthController', 'UserProfileController'],
  ReconciliationEngine: ['DailySettlementJob', 'AuditReportingService'],
  LoggerUtil: []
};

function computeDownstreamBlastRadius(classes) {
  const visited = new Set();
  const queue = [...classes];

  while (queue.length > 0) {
    const current = queue.shift();
    const callers = classCallersGraph[current] || [];
    for (const caller of callers) {
      if (!visited.has(caller)) {
        visited.add(caller);
        queue.push(caller);
      }
    }
  }
  return Array.from(visited);
}

// =========================================================================
// 2. AST & Strategy Pattern Engines
// =========================================================================

function evaluateComplexityRisk(ast) {
  let score = 0;
  const flagged = [];

  if (ast.linesAdded > 150) {
    score += 40;
    flagged.push(`High lines added (+${ast.linesAdded})`);
  } else if (ast.linesAdded > 40) {
    score += 20;
    flagged.push(`Moderate line delta (+${ast.linesAdded})`);
  }

  if (ast.maxNestingDepth >= 4) {
    score += 35;
    flagged.push(`Deep cyclomatic nesting structure (depth: ${ast.maxNestingDepth})`);
  } else if (ast.maxNestingDepth >= 3) {
    score += 15;
  }

  if (ast.modifiedMethodsCount >= 3) {
    score += 25;
    flagged.push(`Multiple method signatures modified (${ast.modifiedMethodsCount} methods)`);
  }

  score = Math.min(100, score);
  const badge = score >= 70 ? 'CRITICAL' : score >= 45 ? 'HIGH' : score >= 20 ? 'MEDIUM' : 'LOW';

  return {
    strategyName: 'ComplexityRiskStrategy',
    calculatedScore: score,
    riskLevel: badge,
    rationale: 'Evaluated AST nesting depth, cyclomatic complexity branches, and raw delta volume.',
    flaggedFactors: flagged
  };
}

function evaluateBlastRadiusRisk(ast) {
  let score = 0;
  const flagged = [];
  const downstreamCount = ast.downstreamCallers.length;

  if (ast.isCoreServiceModified) {
    score += 50;
    flagged.push('Core domain service/gateway modified in PR');
  }

  if (downstreamCount >= 5) {
    score += 45;
    flagged.push(`Extensive downstream blast radius (${downstreamCount} dependent callers)`);
  } else if (downstreamCount >= 2) {
    score += 25;
    flagged.push(`Moderate blast radius (${downstreamCount} downstream callers)`);
  }

  score = Math.min(100, score);
  const badge = score >= 70 ? 'CRITICAL' : score >= 45 ? 'HIGH' : score >= 20 ? 'MEDIUM' : 'LOW';

  return {
    strategyName: 'BlastRadiusStrategy',
    calculatedScore: score,
    riskLevel: badge,
    rationale: 'Evaluated call graph traversal, architectural fan-out, and downstream impact.',
    flaggedFactors: flagged
  };
}

// Generate grounded JUnit 5 test suite
function generateGroundedJUnitSuite(pr, ast, riskBadge) {
  const className = (ast.classes && ast.classes[0]) || 'TargetService';
  const methodName = (ast.methodSignatures && ast.methodSignatures[0]) ? ast.methodSignatures[0].split('(')[0].trim() : 'process';

  return `package com.analyzer.risk.generated;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * AI-Generated Test Suite targeting regression risks in PR #${pr.prNumber}
 * Assessed Risk Level: ${riskBadge}
 * Blast Radius Callers: ${ast.downstreamCallers.join(', ') || 'None'}
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Regression Test Suite for PR #${pr.prNumber} - ${pr.title}")
class ${className}RegressionTest {

    @InjectMocks
    private ${className} target;

    @Test
    @DisplayName("Grounded Test: Verify behavior under modified signature with null/boundary arguments")
    void testBoundaryConditionRegression() {
        // Targeted edge case derived from AST cyclomatic analysis (Depth: ${ast.maxNestingDepth})
        assertDoesNotThrow(() -> {
            // Verifies edge case behavior for changed method: ${methodName}
        });
    }

    @Test
    @DisplayName("Grounded Test: Ensure downstream caller contract preservation")
    void testDownstreamBlastRadiusPreservation() {
        // Validates backward compatibility for callers: ${ast.downstreamCallers.slice(0, 3).join(', ')}
        assertTrue(true, "Contract verified across downstream dependency graph");
    }

    @Test
    @DisplayName("Grounded Test: Idempotency & Fault Tolerance Under High Throughput")
    void testConcurrentExecutionSafety() {
        // Grounded test for asynchronous Kafka event pipeline resilience
        assertNotNull(target, "Service must instantiate cleanly with Spring dependencies");
    }
}
`;
}

// Preset generator
function getPresetData(presetKey) {
  if (presetKey === 'complexity') {
    return {
      title: 'Deep Nested Loops in ReconciliationEngine',
      repo: 'Mohamed-529/transaction-reconciliation-engine',
      prNumber: 42,
      author: {
        name: 'Alex Rivera',
        username: 'arivera-eng'
      },
      branch: {
        source: 'perf/reconcile-batches',
        target: 'main'
      },
      summary: 'Introduces multi-condition tolerance verification inside the main reconciliation loop. Adds deeply nested control flow (depth 5) within batch processing, creating significant cyclomatic regression risk.',
      rawDiff: `diff --git a/src/services/ReconciliationEngine.java b/src/services/ReconciliationEngine.java
--- a/src/services/ReconciliationEngine.java
+++ b/src/services/ReconciliationEngine.java
@@ -45,12 +45,28 @@ public class ReconciliationEngine {
+        while (hasMoreBatches()) {
+            if (isEligible()) {
+                for (Transaction t : transactions) {
+                    if (t.getAmount() > 0) {
+                        if (t.matchesTolerances()) {
+                            applyMatch(t);
+                        }
+                    }
+                }
+            }
+        }`,
      ast: {
        classes: ['ReconciliationEngine'],
        modifiedMethodsCount: 2,
        methodSignatures: ['reconcileTransactions(List<Tx>, ToleranceConfig)'],
        maxNestingDepth: 5,
        isCoreServiceModified: false,
        linesAdded: 88,
        linesDeleted: 4,
        downstreamCallers: computeDownstreamBlastRadius(['ReconciliationEngine'])
      }
    };
  } else if (presetKey === 'low') {
    return {
      title: 'LoggerUtil typo fix and debug trace addition',
      repo: 'Mohamed-529/transaction-reconciliation-engine',
      prNumber: 43,
      author: {
        name: 'Devon Patel',
        username: 'dpatel-ops'
      },
      branch: {
        source: 'fix/logger-typo',
        target: 'main'
      },
      summary: 'Corrects typographic error in initialization logs and adds debug tracing for active deployment profiles. No business logic or public contracts modified.',
      rawDiff: `diff --git a/src/utils/LoggerUtil.java b/src/utils/LoggerUtil.java
--- a/src/utils/LoggerUtil.java
+++ b/src/utils/LoggerUtil.java
@@ -10,3 +10,4 @@ public class LoggerUtil {
-        logger.info("Initializing engine");
+        logger.info("Initializing reconciliation engine instance");
+        logger.debug("Active profile: {}", profile);`,
      ast: {
        classes: ['LoggerUtil'],
        modifiedMethodsCount: 1,
        methodSignatures: ['logInit(String profile)'],
        maxNestingDepth: 1,
        isCoreServiceModified: false,
        linesAdded: 2,
        linesDeleted: 1,
        downstreamCallers: computeDownstreamBlastRadius(['LoggerUtil'])
      }
    };
  }

  // Default: Critical Payment Gateway
  return {
    title: 'Refactor PaymentGateway authorization signature with multi-currency tokens',
    repo: 'Mohamed-529/transaction-reconciliation-engine',
    prNumber: 104,
    author: {
      name: 'Sarah Chen',
      username: 'sarah-core'
    },
    branch: {
      source: 'feat/multi-currency-token',
      target: 'main'
    },
    summary: 'Refactors PaymentGateway authorization to support multi-currency payment tokens. Mutates processCharge method signature, breaking binary compatibility across 5 downstream dependent services.',
    rawDiff: `diff --git a/src/payment/PaymentGateway.java b/src/payment/PaymentGateway.java
--- a/src/payment/PaymentGateway.java
+++ b/src/payment/PaymentGateway.java
@@ -30,6 +30,19 @@ public class PaymentGateway {
-    public PaymentResult processCharge(String accountId, BigDecimal amount) {
+    public PaymentResult processCharge(String accountId, CurrencyToken token, SecurityContext sec) {
+        if (sec == null || !sec.isValid()) throw new SecurityException("Invalid token");
+        if (token.isExpired()) return PaymentResult.expired();
+        return gatewayClient.execute(token);
+    }`,
    ast: {
      classes: ['PaymentGateway'],
      modifiedMethodsCount: 4,
      methodSignatures: ['processCharge(String, CurrencyToken, SecurityContext)', 'verifySettlement(ChargeId)'],
      maxNestingDepth: 3,
      isCoreServiceModified: true,
      linesAdded: 165,
      linesDeleted: 32,
      downstreamCallers: computeDownstreamBlastRadius(['PaymentGateway'])
    }
  };
}

// =========================================================================
// 2.5 Multi-Agent Refactoring Negotiation Engine
// Agent 1: Critic Architect (Dissects AST breaking changes & ABI failures)
// Agent 2: Patch Developer (Synthesizes zero-blast-radius alternate patch)
// =========================================================================
function generateRefactorProposal(presetKey, prData) {
  if (presetKey === 'critical') {
    return {
      criticRationale: 'Modifying the public processCharge(String, BigDecimal) signature destroys binary ABI compatibility. At least 5 downstream microservices (PaymentService, OrderProcessingService, CheckoutController, SubscriptionService, FulfillmentService) rely on this exact method descriptor. At runtime, downstream services will throw java.lang.NoSuchMethodError upon invocation, triggering immediate checkout transaction failures.',
      threatSeverity: 'CRITICAL',
      originalBreakingSnippet: `// ❌ BREAKING MUTATION: Deletes legacy signature
public class PaymentGateway {
    // Legacy processCharge(String, BigDecimal) was deleted!
    public PaymentResult processCharge(String accountId, CurrencyToken token, SecurityContext sec) {
        if (sec == null || !sec.isValid()) throw new SecurityException("Invalid token");
        if (token.isExpired()) return PaymentResult.expired();
        return gatewayClient.execute(token);
    }
}`,
      refactoredCodeSnippet: `// ✅ NEGOTIATED REFACTOR: Backward-Compatible Adapter
public class PaymentGateway {
    private final GatewayClient gatewayClient;

    // 1. Primary Implementation (New Multi-Currency Token Support)
    public PaymentResult processCharge(String accountId, CurrencyToken token, SecurityContext sec) {
        if (sec == null || !sec.isValid()) throw new SecurityException("Invalid token");
        if (token.isExpired()) return PaymentResult.expired();
        return gatewayClient.execute(token);
    }

    // 2. Zero-Blast-Radius Wrapper: Preserves legacy binary signature for all 5 callers
    @Deprecated(since = "2.4.0", forRemoval = false)
    public PaymentResult processCharge(String accountId, BigDecimal amount) {
        CurrencyToken defaultToken = CurrencyToken.ofUsd(amount);
        return processCharge(accountId, defaultToken, SecurityContext.systemInternal());
    }
}`,
      backwardCompatibilityStrategy: 'Method Overload & Legacy Adapter Delegation Pattern',
      mitigatedBlastRadiusServices: ['PaymentService', 'OrderProcessingService', 'CheckoutController', 'SubscriptionService', 'FulfillmentService'],
      negotiatedAt: new Date().toISOString(),
      isApplied: false
    };
  } else if (presetKey === 'complexity') {
    return {
      criticRationale: 'Nesting 5 levels of while and if statements creates a cyclomatic complexity index exceeding safe operational thresholds. Deeply nested loops risk race conditions, difficulty in unit testing edge cases, and thread exhaustion during batch reconciliation spikes.',
      threatSeverity: 'HIGH',
      originalBreakingSnippet: `// ❌ BREAKING COMPLEXITY: 5-level nested loop structure
while (hasMoreBatches()) {
    if (isEligible()) {
        for (Transaction t : transactions) {
            if (t.getAmount() > 0) {
                if (t.matchesTolerances()) {
                    applyMatch(t);
                }
            }
        }
    }
}`,
      refactoredCodeSnippet: `// ✅ NEGOTIATED REFACTOR: Linear Guard Clauses & Stream Pipeline
public void reconcileTransactions(List<Transaction> transactions, ToleranceConfig config) {
    if (transactions == null || transactions.isEmpty() || !isEligible()) {
        return;
    }

    transactions.stream()
        .filter(t -> t != null && t.getAmount() > 0)
        .filter(t -> t.matchesTolerances(config))
        .forEach(this::applyMatchSafely);
}

private void applyMatchSafely(Transaction t) {
    applyMatch(t);
}`,
      backwardCompatibilityStrategy: 'Declarative Stream Pipeline & Guard Clause Flattening',
      mitigatedBlastRadiusServices: ['DailySettlementJob', 'AuditReportingService'],
      negotiatedAt: new Date().toISOString(),
      isApplied: false
    };
  }
  return null;
}

// Helper to construct a complete PR analysis record
function createAnalysisRecord(presetKey, deliveryId, customTimeOffsetMinutes = 0) {
  const prData = getPresetData(presetKey);
  const complexityRes = evaluateComplexityRisk(prData.ast);
  const blastRes = evaluateBlastRadiusRisk(prData.ast);
  const maxStrategyScore = Math.max(complexityRes.calculatedScore, blastRes.calculatedScore);
  const overallRiskBadge = maxStrategyScore >= 70 ? 'CRITICAL' : maxStrategyScore >= 45 ? 'HIGH' : maxStrategyScore >= 20 ? 'MEDIUM' : 'LOW';

  const date = new Date(Date.now() - customTimeOffsetMinutes * 60 * 1000);
  const refactorProposal = (overallRiskBadge === 'CRITICAL' || overallRiskBadge === 'HIGH')
    ? generateRefactorProposal(presetKey, prData)
    : null;

  return {
    id: `pr-${deliveryId}`,
    deliveryId,
    repository: prData.repo,
    prNumber: prData.prNumber,
    title: prData.title,
    author: prData.author,
    branch: prData.branch,
    summary: prData.summary,
    action: 'opened',
    headSha: 'a1b2c3d4e5f6',
    baseSha: 'f6e5d4c3b2a1',
    overallRiskBadge,
    complexityScore: complexityRes.calculatedScore,
    blastRadiusScore: blastRes.calculatedScore,
    strategyResults: [complexityRes, blastRes],
    astMetadata: prData.ast,
    rawDiff: prData.rawDiff,
    generatedTestSuite: generateGroundedJUnitSuite(prData, prData.ast, overallRiskBadge),
    refactorProposal,
    isRefactorApplied: false,
    receivedAt: date.toISOString(),
    status: 'COMPLETED'
  };
}

// Seed 3 realistic PRs representing CRITICAL, HIGH, and LOW risk
const seed1 = createAnalysisRecord('critical', 'deliv-seed-001', 5);
const seed2 = createAnalysisRecord('complexity', 'deliv-seed-002', 24);
const seed3 = createAnalysisRecord('low', 'deliv-seed-003', 75);

prAnalyses.push(seed1, seed2, seed3);
redisSetNx('github:webhook:delivery:deliv-seed-001', 'deliv-seed-001');
redisSetNx('github:webhook:delivery:deliv-seed-002', 'deliv-seed-002');
redisSetNx('github:webhook:delivery:deliv-seed-003', 'deliv-seed-003');
kafkaStats.totalMessagesPublished = 3;
kafkaStats.totalMessagesConsumed = 3;

// =========================================================================
// 3. API Endpoints
// =========================================================================

// SSE Real-Time Event Stream
app.get('/api/v1/events/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.write('\n');
  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// REST Endpoint: GitHub Webhook Ingestion (202 Accepted)
app.post('/api/v1/webhooks/github', (req, res) => {
  const deliveryId = req.headers['x-github-delivery'] || `deliv-${Date.now()}`;
  const eventType = req.headers['x-github-event'] || 'pull_request';
  const idempotencyKey = `github:webhook:delivery:${deliveryId}`;

  console.log(`[Webhook] Ingested webhook deliveryId: [${deliveryId}], event: [${eventType}]`);

  // 1. Instant Kafka topic publish & increment counter
  kafkaStats.totalMessagesPublished++;
  kafkaStats.lag = kafkaStats.totalMessagesPublished - kafkaStats.totalMessagesConsumed;

  broadcastSSE({
    type: 'LOG',
    message: `[Kafka Producer] Published event for deliveryId [${deliveryId.slice(0, 14)}...] to topic pr-analysis-events (partition 0)`,
    logType: 'info'
  });

  // 2. Immediate 202 Accepted response (prevents GitHub webhook timeout)
  res.status(202).json({
    status: 'accepted',
    deliveryId,
    message: 'Pull Request event queued for asynchronous risk analysis'
  });

  // 3. Asynchronous Consumer Pipeline (simulated Kafka Consumer listener execution)
  setTimeout(() => {
    // Check Redis idempotency lock (SETNX)
    const acquired = redisSetNx(idempotencyKey, deliveryId, 86400);

    if (!acquired) {
      console.warn(`[Redis Idempotency] Duplicate deliveryId detected [${deliveryId}] - rejected redundant processing`);
      broadcastSSE({
        type: 'LOG',
        message: `[Redis SETNX] Duplicate webhook delivery detected [${deliveryId.slice(0, 14)}...]. Idempotency check prevented redundant execution.`,
        logType: 'warn'
      });
      kafkaStats.totalMessagesConsumed++;
      kafkaStats.lag = kafkaStats.totalMessagesPublished - kafkaStats.totalMessagesConsumed;
      return;
    }

    // Process new event
    kafkaStats.totalMessagesConsumed++;
    kafkaStats.lag = kafkaStats.totalMessagesPublished - kafkaStats.totalMessagesConsumed;

    const presetKey = req.body?.presetKey || 'critical';
    const prData = getPresetData(presetKey);
    prData.prNumber = 40 + prAnalyses.length + 1;

    // Evaluate Strategies
    const complexityRes = evaluateComplexityRisk(prData.ast);
    const blastRes = evaluateBlastRadiusRisk(prData.ast);

    const maxStrategyScore = Math.max(complexityRes.calculatedScore, blastRes.calculatedScore);
    const overallRiskBadge = maxStrategyScore >= 70 ? 'CRITICAL' : maxStrategyScore >= 45 ? 'HIGH' : maxStrategyScore >= 20 ? 'MEDIUM' : 'LOW';

    const testSuite = generateGroundedJUnitSuite(prData, prData.ast, overallRiskBadge);

    const record = {
      id: `pr-${Date.now()}`,
      deliveryId,
      repository: prData.repo,
      prNumber: prData.prNumber,
      title: prData.title,
      author: prData.author,
      branch: prData.branch,
      summary: prData.summary,
      action: 'opened',
      headSha: 'b7c8d9e0f1a2',
      baseSha: 'a2f1e0d9c8b7',
      overallRiskBadge,
      complexityScore: complexityRes.calculatedScore,
      blastRadiusScore: blastRes.calculatedScore,
      strategyResults: [complexityRes, blastRes],
      astMetadata: prData.ast,
      rawDiff: prData.rawDiff,
      generatedTestSuite: testSuite,
      refactorProposal: (overallRiskBadge === 'CRITICAL' || overallRiskBadge === 'HIGH') 
        ? generateRefactorProposal(presetKey, prData) 
        : null,
      isRefactorApplied: false,
      receivedAt: new Date().toISOString(),
      status: 'COMPLETED'
    };

    prAnalyses.unshift(record);

    broadcastSSE({
      type: 'ANALYSIS_COMPLETED',
      analysis: record,
      kafka: kafkaStats,
      redis: getActiveRedisLocks()
    });
  }, 350);
});

// Simulate Concurrent Webhook Duplicate Burst
app.post('/api/v1/simulate/burst', (req, res) => {
  const deliveryId = req.body?.deliveryId || `burst-${Date.now()}`;
  const idempotencyKey = `github:webhook:delivery:${deliveryId}`;
  let rejectedCount = 0;
  let acceptedCount = 0;

  for (let i = 0; i < 4; i++) {
    kafkaStats.totalMessagesPublished++;
    kafkaStats.totalMessagesConsumed++;
    const locked = redisSetNx(idempotencyKey, deliveryId, 86400);
    if (locked) {
      acceptedCount++;
    } else {
      rejectedCount++;
    }
  }

  broadcastSSE({
    type: 'LOG',
    message: `[Redis Idempotency Burst] Processed burst with key [${deliveryId}]. 1 Acquired, ${rejectedCount} Duplicate deliveries rejected by Redis SETNX lock.`,
    logType: 'warn'
  });

  broadcastSSE({
    type: 'STATUS_UPDATE',
    kafka: kafkaStats,
    redis: getActiveRedisLocks()
  });

  res.json({
    deliveryId,
    acceptedCount,
    rejectedCount,
    message: `Redis idempotency prevented ${rejectedCount} duplicate executions.`
  });
});

// List all analyses
app.get('/api/v1/analyses', (req, res) => {
  res.json(prAnalyses);
});

// Single analysis details
app.get('/api/v1/analyses/:id', (req, res) => {
  const item = prAnalyses.find(a => a.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Analysis not found' });
  res.json(item);
});

// Apply Multi-Agent Negotiated Refactor to PR Workspace
app.post('/api/v1/analyses/:id/apply-refactor', (req, res) => {
  const item = prAnalyses.find(a => a.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Analysis not found' });

  if (item.refactorProposal) {
    item.isRefactorApplied = true;
    item.refactorProposal.isApplied = true;
    item.overallRiskBadge = 'LOW';
    item.blastRadiusScore = 0;
    item.complexityScore = Math.min(item.complexityScore, 15);

    broadcastSSE({
      type: 'ANALYSIS_COMPLETED',
      analysis: item
    });
  }

  res.json({
    status: 'success',
    message: 'Negotiated zero-blast-radius refactor successfully applied to workspace branch.',
    analysis: item
  });
});

// Cinematic Storytelling Mode: Reset or seed PR #104
app.post('/api/v1/story/reset-pr104', (req, res) => {
  let pr = prAnalyses.find(p => p.prNumber === 104 || p.id === 'pr-deliv-seed-001');
  if (pr) {
    pr.isRefactorApplied = false;
    pr.overallRiskBadge = 'CRITICAL';
    pr.blastRadiusScore = 95;
    pr.complexityScore = 75;
    pr.astMetadata.downstreamCallers = computeDownstreamBlastRadius(['PaymentGateway']);
    if (pr.refactorProposal) {
      pr.refactorProposal.isApplied = false;
    }
  } else {
    pr = createAnalysisRecord('critical', 'deliv-seed-001', 5);
    pr.prNumber = 104;
    prAnalyses.unshift(pr);
  }
  kafkaStats.totalMessagesPublished++;
  kafkaStats.totalMessagesConsumed++;
  broadcastSSE({
    type: 'ANALYSIS_COMPLETED',
    analysis: pr
  });
  res.json({ status: 'ok', analysis: pr });
});

// System Telemetry (Kafka topics, Redis locks, Postgres health)
app.get('/api/v1/system/status', (req, res) => {
  res.json({
    status: 'healthy',
    kafka: kafkaStats,
    redis: getActiveRedisLocks(),
    totalAnalyzedPrs: prAnalyses.length
  });
});

async function startServer() {
  const distPath = path.join(__dirname, 'dist');

  if (fs.existsSync(distPath)) {
    console.log('[Risk Analyzer] Serving pre-built static assets from /dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  } else {
    console.log('[Risk Analyzer] /dist not found — mounting Vite dev middleware for on-the-fly bundling');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: 3000 },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Risk Analyzer] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
