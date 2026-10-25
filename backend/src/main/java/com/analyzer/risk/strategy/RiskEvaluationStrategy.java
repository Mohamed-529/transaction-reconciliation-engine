package com.analyzer.risk.strategy;

import java.util.Map;

/**
 * Strategy interface for evaluating pull request regression risk.
 */
public interface RiskEvaluationStrategy {
    String getStrategyName();
    
    RiskAssessmentResult evaluateRisk(
            String rawGitDiff,
            Map<String, Object> astAnalysisMetadata
    );
}
