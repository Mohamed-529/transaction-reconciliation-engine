package com.analyzer.risk.repository;

import com.analyzer.risk.model.RefactorProposalEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefactorProposalRepository extends JpaRepository<RefactorProposalEntity, Long> {
    Optional<RefactorProposalEntity> findByAnalysisId(Long analysisId);
}
