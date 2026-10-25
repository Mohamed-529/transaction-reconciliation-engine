package com.analyzer.risk.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service to map out class dependencies and calculate downstream blast radius.
 */
@Service
@Slf4j
public class DependencyGraphService {

    // Simple in-memory representation of project class call graph
    private final Map<String, Set<String>> classCallersGraph = new HashMap<>();

    public DependencyGraphService() {
        // Seed typical enterprise Java service call graphs for demonstration
        registerEdge("PaymentGateway", "PaymentService");
        registerEdge("PaymentService", "OrderProcessingService");
        registerEdge("PaymentService", "CheckoutController");
        registerEdge("OrderProcessingService", "FulfillmentService");
        registerEdge("OrderProcessingService", "NotificationService");
        registerEdge("UserRepository", "UserService");
        registerEdge("UserService", "AuthController");
    }

    public synchronized void registerEdge(String targetClass, String callerClass) {
        classCallersGraph.computeIfAbsent(targetClass, k -> new HashSet<>()).add(callerClass);
    }

    public Set<String> computeDownstreamBlastRadius(Collection<String> modifiedClasses) {
        Set<String> visited = new HashSet<>();
        Queue<String> queue = new LinkedList<>(modifiedClasses);

        while (!queue.isEmpty()) {
            String current = queue.poll();
            Set<String> callers = classCallersGraph.getOrDefault(current, Collections.emptySet());
            for (String caller : callers) {
                if (visited.add(caller)) {
                    queue.add(caller);
                }
            }
        }
        return visited;
    }
}
