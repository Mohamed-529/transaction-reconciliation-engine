package com.analyzer.risk.service;

import com.analyzer.risk.model.RefactorProposal;
import com.analyzer.risk.model.RiskBadge;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.input.Prompt;
import dev.langchain4j.model.input.PromptTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Multi-Agent Refactoring Negotiation Engine.
 * 
 * Orchestrates a two-agent cooperative negotiation sequence:
 * - Agent 1 (The Critic Architect): Dissects AST breaking changes & downstream binary compatibility failures.
 * - Agent 2 (The Patch Developer): Consumes Agent 1's critique and synthesizes a zero-blast-radius alternate implementation.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MultiAgentNegotiationService {

    private final ChatLanguageModel chatLanguageModel;

    // Agent 1: System Critic Architect Prompt
    private static final PromptTemplate CRITIC_ARCHITECT_PROMPT = PromptTemplate.from("""
            [ROLE]: Principal System Critic & Enterprise Architect.
            You are reviewing a Pull Request that was assigned a {{riskLevel}} threat badge by the JavaParser static analyzer.
            
            [TARGET CLASS]: {{targetClass}}
            [DOWNSTREAM IMPACTED CALLERS]: {{downstreamCallers}}
            [MUTATED AST METHOD SIGNATURES]: {{methodSignatures}}
            
            [GIT DIFF]:
            ```diff
            {{diff}}
            ```
            
            TASK:
            Deliver a concise, ruthless architectural critique. Detail:
            1. Why mutating this method signature breaks binary/source compatibility for the {{downstreamCallersCount}} downstream callers.
            2. The exact runtime failures (NoSuchMethodError, ClassCastException, NullPointer) that will trigger in production if merged.
            Limit response to 2 clear, impactful paragraphs.
            """);

    // Agent 2: Automated Patch Developer Prompt
    private static final PromptTemplate PATCH_DEVELOPER_PROMPT = PromptTemplate.from("""
            [ROLE]: Senior Staff Software Engineer & Refactoring Specialist.
            You are responding to an Architectural Critique from the System Critic Architect.
            
            [CRITIC ARCHITECT CRITIQUE]:
            {{critique}}
            
            [ORIGINAL CODE DIFF]:
            ```diff
            {{diff}}
            ```
            
            TASK:
            Rewrite the Java class/method block using defensive, backward-compatible design patterns (e.g., Method Overloading with delegation, Parameter Object adapters, or @Deprecated legacy wrapper).
            
            REQUIREMENTS:
            1. Support the new functional requirements completely.
            2. Preserve the legacy signature exactly so all {{downstreamCallers}} continue functioning with ZERO downtime or code changes.
            3. Output ONLY the compilation-ready refactored Java code block.
            """);

    public RefactorProposal negotiateRefactoring(
            String targetClass,
            RiskBadge riskBadge,
            String rawDiff,
            List<String> methodSignatures,
            List<String> downstreamCallers) {

        log.info("Initiating Multi-Agent Negotiation for class [{}] with risk badge [{}]", targetClass, riskBadge);

        // Step 1: Agent 1 (Critic Architect) Critique
        Prompt criticPrompt = CRITIC_ARCHITECT_PROMPT.apply(Map.of(
                "targetClass", targetClass,
                "riskLevel", riskBadge.name(),
                "downstreamCallers", String.join(", ", downstreamCallers),
                "downstreamCallersCount", downstreamCallers.size(),
                "methodSignatures", String.join("; ", methodSignatures),
                "diff", rawDiff
        ));

        String critique = chatLanguageModel.generate(criticPrompt.text());
        log.info("Agent 1 (Critic Architect) completed critique for [{}]", targetClass);

        // Step 2: Agent 2 (Automated Patch Developer) Alternate Refactor
        Prompt patchPrompt = PATCH_DEVELOPER_PROMPT.apply(Map.of(
                "critique", critique,
                "diff", rawDiff,
                "downstreamCallers", String.join(", ", downstreamCallers)
        ));

        String refactoredCode = chatLanguageModel.generate(patchPrompt.text());
        log.info("Agent 2 (Patch Developer) synthesized backward-compatible alternate patch for [{}]", targetClass);

        return RefactorProposal.builder()
                .criticRationale(critique)
                .threatSeverity(riskBadge.name())
                .refactoredCodeSnippet(refactoredCode)
                .originalBreakingSnippet(rawDiff)
                .backwardCompatibilityStrategy("Method Overloading & Legacy Delegation Adapter Pattern")
                .mitigatedBlastRadiusServices(downstreamCallers)
                .negotiatedAt(Instant.now())
                .build();
    }
}
