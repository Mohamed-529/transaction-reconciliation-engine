package com.analyzer.risk.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PrEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${app.kafka.topics.pr-analysis:pr-analysis-events}")
    private String topicName;

    public void publishPrEvent(PrAnalysisEvent event) {
        log.info("Publishing PR analysis event to Kafka topic: [{}] with key (DeliveryId): [{}]", topicName, event.getDeliveryId());
        kafkaTemplate.send(topicName, event.getDeliveryId(), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish PR event [{}]: {}", event.getDeliveryId(), ex.getMessage());
                    } else {
                        log.debug("Successfully published PR event [{}] to partition [{}]", 
                                event.getDeliveryId(), result.getRecordMetadata().partition());
                    }
                });
    }
}
