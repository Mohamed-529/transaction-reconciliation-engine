package com.analyzer.risk.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefactorProposal implements Serializable {
    private String criticRationale;
    private String threatSeverity;
    private String refactoredCodeSnippet;
    private String originalBreakingSnippet;
    private String backwardCompatibilityStrategy;
    private List<String> mitigatedBlastRadiusServices;
    private Instant negotiatedAt;
}
