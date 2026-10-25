package com.analyzer.risk.webhook.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class GitHubWebhookPayload {
    private String action;
    private int number;

    @JsonProperty("pull_request")
    private PullRequestDetails pullRequest;

    private RepositoryDetails repository;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PullRequestDetails {
        private Long id;
        private int number;
        private String title;
        private String body;
        private String state;
        
        @JsonProperty("diff_url")
        private String diffUrl;
        
        private HeadCommit head;
        private BaseCommit base;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class RepositoryDetails {
        private String name;
        
        @JsonProperty("full_name")
        private String fullName;
        
        @JsonProperty("clone_url")
        private String cloneUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class HeadCommit {
        private String sha;
        private String ref;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class BaseCommit {
        private String sha;
        private String ref;
    }
}
