package com.analyzer.risk.kafka;

import com.analyzer.risk.webhook.dto.GitHubWebhookPayload;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrAnalysisEvent implements Serializable {
    private String deliveryId;
    private String repository;
    private int prNumber;
    private String action;
    private String headSha;
    private String baseSha;
    private String diffUrl;
    private Instant receivedAt;
    private GitHubWebhookPayload rawPayload;
}
