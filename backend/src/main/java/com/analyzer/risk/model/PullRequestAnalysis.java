package com.analyzer.risk.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "pr_analyses", indexes = {
    @Index(name = "idx_pr_delivery_id", columnList = "deliveryId", unique = true),
    @Index(name = "idx_pr_repo_number", columnList = "repository, prNumber")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PullRequestAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 128)
    private String deliveryId;

    @Column(nullable = false, length = 255)
    private String repository;

    @Column(nullable = false)
    private int prNumber;

    @Column(length = 64)
    private String action;

    @Column(length = 64)
    private String headSha;

    @Column(length = 64)
    private String baseSha;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private RiskBadge overallRiskBadge;

    private double complexityScore;

    private double blastRadiusScore;

    @Column(columnDefinition = "TEXT")
    private String rationale;

    @Column(columnDefinition = "TEXT")
    private String identifiedBreakingChanges;

    @Column(columnDefinition = "TEXT")
    private String generatedTestSuite;

    @OneToOne(mappedBy = "analysis", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private RefactorProposalEntity refactorProposal;

    @Builder.Default
    private boolean isRefactorApplied = false;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}

