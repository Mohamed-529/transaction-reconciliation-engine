package com.analyzer.risk.service;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.input.Prompt;
import dev.langchain4j.model.input.PromptTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Service that performs strict semantic OpenAI grounding to generate targeted JUnit 5 test suites.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OpenAiTestGenerationService {

    private final ChatLanguageModel chatLanguageModel;

    private static final PromptTemplate PROMPT_TEMPLATE = PromptTemplate.from("""
            You are a Principal Test Automation Engineer.
            Analyze the following Git Diff and Abstract Syntax Tree (AST) context of an incoming Pull Request.
            
            [PULL REQUEST CONTEXT]
            Repository: {{repository}}
            PR Number: #{{prNumber}}
            Risk Level: {{riskLevel}}
            Identified Breaking Changes & Blast Radius:
            {{context}}
            
            [GIT DIFF]
            ```diff
            {{diff}}
            ```
            
            TASK:
            1. Identify subtle edge cases, nullability shifts, and regression risks in the modified Java methods.
            2. Generate a complete, compilation-ready JUnit 5 test class with Mockito.
            3. Target the specific edge cases flagged in the risk analysis.
            Output ONLY the Java code block inside ```java ... ```.
            """);

    public String generateTargetedTestSuite(String repository, int prNumber, String riskLevel, String context, String diff) {
        log.info("Generating grounded JUnit test suite via OpenAI for PR #{}", prNumber);
        Prompt prompt = PROMPT_TEMPLATE.apply(Map.of(
                "repository", repository,
                "prNumber", prNumber,
                "riskLevel", riskLevel,
                "context", context,
                "diff", diff
        ));

        return chatLanguageModel.generate(prompt.text());
    }
}
