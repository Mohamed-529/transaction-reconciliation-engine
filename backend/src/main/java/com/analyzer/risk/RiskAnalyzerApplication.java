package com.analyzer.risk;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class RiskAnalyzerApplication {
    public static void main(String[] args) {
        SpringApplication.run(RiskAnalyzerApplication.class, args);
    }
}
