package com.analyzer.risk.strategy;

import com.analyzer.risk.model.RiskBadge;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Strategy #2: Evaluates risk based on downstream blast radius and affected dependencies.
 */
@Component
public class BlastRadiusStrategy implements RiskEvaluationStrategy {

    @Override
    public String getStrategyName() {
        return "BlastRadiusStrategy";
    }

    @Override
    public RiskAssessmentResult evaluateRisk(String rawGitDiff, Map<String, Object> astAnalysisMetadata) {
        int downstreamCallers = (int) astAnalysisMetadata.getOrDefault("downstreamCallersCount", 0);
        boolean coreServiceModified = (boolean) astAnalysisMetadata.getOrDefault("isCoreServiceModified", false);

        List<String> flaggedFactors = new ArrayList<>();
        double score = 0.0;

        if (coreServiceModified) {
            score += 50.0;
            flaggedFactors.add("Central domain model or critical shared service altered");
        }

        if (downstreamCallers > 10) {
            score += 45.0;
            flaggedFactors.add("Wide blast radius: " + downstreamCallers + " dependent downstream callers");
        } else if (downstreamCallers > 3) {
            score += 25.0;
            flaggedFactors.add("Moderate blast radius: " + downstreamCallers + " downstream callers");
        }

        RiskBadge badge = score >= 75 ? RiskBadge.CRITICAL
                : score >= 50 ? RiskBadge.HIGH
                : score >= 25 ? RiskBadge.MEDIUM
                : RiskBadge.LOW;

        return RiskAssessmentResult.builder()
                .strategyName(getStrategyName())
                .calculatedScore(score)
                .riskLevel(badge)
                .rationale("Assessed based on call-graph propagation and downstream blast radius.")
                .flaggedFactors(flaggedFactors)
                .build();
    }
}
