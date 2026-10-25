package com.analyzer.risk.webhook;

import com.analyzer.risk.kafka.PrAnalysisEvent;
import com.analyzer.risk.kafka.PrEventProducer;
import com.analyzer.risk.webhook.dto.GitHubWebhookPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

/**
 * High-Throughput GitHub Webhook Controller.
 * Instantly acknowledges the webhook with 202 Accepted and delegates processing to Kafka.
 */
@RestController
@RequestMapping("/api/v1/webhooks")
@RequiredArgsConstructor
@Slf4j
public class GitHubWebhookController {

    private final PrEventProducer eventProducer;

    @PostMapping("/github")
    public ResponseEntity<Map<String, Object>> handleGitHubWebhook(
            @RequestHeader(value = "X-GitHub-Delivery", required = true) String deliveryId,
            @RequestHeader(value = "X-GitHub-Event", defaultValue = "pull_request") String eventType,
            @RequestBody GitHubWebhookPayload payload) {

        log.info("Received GitHub Webhook. DeliveryId: [{}], Event: [{}]", deliveryId, eventType);

        if (!"pull_request".equalsIgnoreCase(eventType)) {
            return ResponseEntity.ok(Map.of("status", "ignored", "reason", "Unsupported event type: " + eventType));
        }

        // Create Kafka Event representation
        PrAnalysisEvent event = PrAnalysisEvent.builder()
                .deliveryId(deliveryId)
                .repository(payload.getRepository() != null ? payload.getRepository().getFullName() : "unknown")
                .prNumber(payload.getNumber())
                .action(payload.getAction())
                .headSha(payload.getPullRequest() != null && payload.getPullRequest().getHead() != null 
                        ? payload.getPullRequest().getHead().getSha() : null)
                .baseSha(payload.getPullRequest() != null && payload.getPullRequest().getBase() != null 
                        ? payload.getPullRequest().getBase().getSha() : null)
                .diffUrl(payload.getPullRequest() != null ? payload.getPullRequest().getDiffUrl() : null)
                .receivedAt(Instant.now())
                .rawPayload(payload)
                .build();

        // Non-blocking dispatch to Kafka topic 'pr-analysis-events'
        eventProducer.publishPrEvent(event);

        // Immediate 202 Accepted response
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of(
                "status", "accepted",
                "deliveryId", deliveryId,
                "message", "Pull Request event queued for asynchronous risk analysis"
        ));
    }
}
