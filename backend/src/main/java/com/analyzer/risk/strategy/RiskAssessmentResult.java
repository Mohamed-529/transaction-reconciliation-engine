package com.analyzer.risk.strategy;

import com.analyzer.risk.model.RiskBadge;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskAssessmentResult {
    private String strategyName;
    private double calculatedScore; // Normalized 0.0 - 100.0
    private RiskBadge riskLevel;
    private String rationale;
    private List<String> flaggedFactors;
}
