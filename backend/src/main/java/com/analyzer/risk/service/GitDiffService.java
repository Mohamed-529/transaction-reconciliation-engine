package com.analyzer.risk.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service to parse Git diffs and extract file patches, added/removed lines, and changed methods.
 */
@Service
@Slf4j
public class GitDiffService {

    private static final Pattern DIFF_FILE_PATTERN = Pattern.compile("^diff --git a/(.*?) b/(.*?)$", Pattern.MULTILINE);
    private static final Pattern HUNK_HEADER_PATTERN = Pattern.compile("^@@ -(\\d+),?(\\d*) \\+(\\d+),?(\\d*) @@(.*)$", Pattern.MULTILINE);

    public Map<String, Object> parseDiff(String rawDiff) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> files = new ArrayList<>();
        int totalAdded = 0;
        int totalDeleted = 0;

        if (rawDiff == null || rawDiff.isBlank()) {
            result.put("files", Collections.emptyList());
            result.put("linesAdded", 0);
            result.put("linesDeleted", 0);
            return result;
        }

        String[] lines = rawDiff.split("\\r?\\n");
        String currentFile = null;
        List<String> currentChunk = new ArrayList<>();

        for (String line : lines) {
            if (line.startsWith("diff --git")) {
                if (currentFile != null) {
                    files.add(Map.of("file", currentFile, "content", String.join("\n", currentChunk)));
                    currentChunk.clear();
                }
                Matcher m = DIFF_FILE_PATTERN.matcher(line);
                if (m.find()) {
                    currentFile = m.group(2);
                }
            } else {
                currentChunk.add(line);
                if (line.startsWith("+") && !line.startsWith("+++")) {
                    totalAdded++;
                } else if (line.startsWith("-") && !line.startsWith("---")) {
                    totalDeleted++;
                }
            }
        }

        if (currentFile != null) {
            files.add(Map.of("file", currentFile, "content", String.join("\n", currentChunk)));
        }

        result.put("files", files);
        result.put("linesAdded", totalAdded);
        result.put("linesDeleted", totalDeleted);
        return result;
    }
}
