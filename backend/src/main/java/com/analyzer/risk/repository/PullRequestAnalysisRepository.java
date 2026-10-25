package com.analyzer.risk.repository;

import com.analyzer.risk.model.PullRequestAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PullRequestAnalysisRepository extends JpaRepository<PullRequestAnalysis, Long> {
    Optional<PullRequestAnalysis> findByDeliveryId(String deliveryId);
    List<PullRequestAnalysis> findByRepositoryOrderByCreatedAtDesc(String repository);
    List<PullRequestAnalysis> findTop20ByOrderByCreatedAtDesc();
}
