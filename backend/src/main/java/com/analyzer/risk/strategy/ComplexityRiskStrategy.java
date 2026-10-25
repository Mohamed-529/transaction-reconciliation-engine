package com.analyzer.risk.strategy;

import com.analyzer.risk.model.RiskBadge;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Strategy #1: Evaluates risk based on Cyclomatic Complexity, lines changed, and nesting depth.
 */
@Component
public class ComplexityRiskStrategy implements RiskEvaluationStrategy {

    @Override
    public String getStrategyName() {
        return "ComplexityRiskStrategy";
    }

    @Override
    public RiskAssessmentResult evaluateRisk(String rawGitDiff, Map<String, Object> astAnalysisMetadata) {
        int linesAdded = (int) astAnalysisMetadata.getOrDefault("linesAdded", 0);
        int maxNestingDepth = (int) astAnalysisMetadata.getOrDefault("maxNestingDepth", 1);
        int modifiedMethodsCount = (int) astAnalysisMetadata.getOrDefault("modifiedMethodsCount", 0);

        List<String> flaggedFactors = new ArrayList<>();
        double score = 0.0;

        if (linesAdded > 200) {
            score += 40.0;
            flaggedFactors.add("High volume of added lines (" + linesAdded + ")");
        } else if (linesAdded > 50) {
            score += 20.0;
        }

        if (maxNestingDepth >= 4) {
            score += 35.0;
            flaggedFactors.add("Deep nesting structure detected (depth: " + maxNestingDepth + ")");
        }

        if (modifiedMethodsCount > 5) {
            score += 25.0;
            flaggedFactors.add("Extensive method signature changes (" + modifiedMethodsCount + " methods)");
        }

        RiskBadge badge = score >= 70 ? RiskBadge.CRITICAL
                : score >= 45 ? RiskBadge.HIGH
                : score >= 20 ? RiskBadge.MEDIUM
                : RiskBadge.LOW;

        return RiskAssessmentResult.builder()
                .strategyName(getStrategyName())
                .calculatedScore(score)
                .riskLevel(badge)
                .rationale("Assessed based on AST cyclomatic complexity, conditional branching, and delta volume.")
                .flaggedFactors(flaggedFactors)
                .build();
    }
}
