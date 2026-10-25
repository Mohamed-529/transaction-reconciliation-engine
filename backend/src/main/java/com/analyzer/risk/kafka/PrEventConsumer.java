package com.analyzer.risk.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Kafka Consumer for pr-analysis-events with Redis-based Idempotency Control.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PrEventConsumer {

    private final StringRedisTemplate redisTemplate;

    @Value("${app.idempotency.ttl-seconds:86400}")
    private long idempotencyTtlSeconds;

    @KafkaListener(topics = "${app.kafka.topics.pr-analysis:pr-analysis-events}", groupId = "pr-risk-analysis-group")
    public void consumePrAnalysisEvent(PrAnalysisEvent event) {
        String deliveryId = event.getDeliveryId();
        String idempotencyKey = "github:webhook:delivery:" + deliveryId;

        // Atomic check-and-set using Redis SETNX
        Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(idempotencyKey, "PROCESSED", Duration.ofSeconds(idempotencyTtlSeconds));

        if (Boolean.FALSE.equals(acquired)) {
            log.warn("Duplicate webhook delivery detected [{}]. Idempotency check prevented redundant processing.", deliveryId);
            return;
        }

        log.info("Processing new PR Analysis Event for repo [{}], PR #{}", event.getRepository(), event.getPrNumber());

        // Pipeline execution triggers:
        // 1. Git Diff Extraction
        // 2. JavaParser AST & Dependency Graph construction
        // 3. Strategy Pattern Risk Assessment (Complexity & Blast Radius)
        // 4. OpenAI Grounded JUnit Test Generation
        // 5. Real-time WebSocket event broadcast
    }
}
