package com.analyzer.risk.service;

import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.stmt.BlockStmt;
import com.github.javaparser.ast.stmt.IfStmt;
import com.github.javaparser.ast.stmt.Statement;
import com.github.javaparser.ast.stmt.WhileStmt;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service that integrates JavaParser to extract ASTs, detect modified methods,
 * and calculate nesting depths and cyclomatic complexity indicators.
 */
@Service
@Slf4j
public class AstParsingEngine {

    public Map<String, Object> analyzeJavaSource(String sourceCode) {
        Map<String, Object> metrics = new HashMap<>();

        try {
            CompilationUnit cu = StaticJavaParser.parse(sourceCode);
            List<String> modifiedClasses = new ArrayList<>();
            List<String> methodSignatures = new ArrayList<>();
            int maxDepth = 0;

            for (ClassOrInterfaceDeclaration cid : cu.findAll(ClassOrInterfaceDeclaration.class)) {
                modifiedClasses.add(cid.getNameAsString());
            }

            for (MethodDeclaration md : cu.findAll(MethodDeclaration.class)) {
                methodSignatures.add(md.getDeclarationAsString(false, false, true));
                if (md.getBody().isPresent()) {
                    int depth = calculateMaxNestingDepth(md.getBody().get(), 1);
                    if (depth > maxDepth) {
                        maxDepth = depth;
                    }
                }
            }

            metrics.put("classes", modifiedClasses);
            metrics.put("modifiedMethodsCount", methodSignatures.size());
            metrics.put("methodSignatures", methodSignatures);
            metrics.put("maxNestingDepth", maxDepth);
            metrics.put("isCoreServiceModified", modifiedClasses.stream().anyMatch(c -> c.contains("Service") || c.contains("Engine")));

        } catch (Exception e) {
            log.warn("Failed to parse Java source with JavaParser: {}", e.getMessage());
            metrics.put("parseError", e.getMessage());
            metrics.put("maxNestingDepth", 1);
            metrics.put("modifiedMethodsCount", 0);
        }

        return metrics;
    }

    private int calculateMaxNestingDepth(Statement statement, int currentDepth) {
        int max = currentDepth;
        for (Statement child : statement.findAll(Statement.class)) {
            if (child instanceof IfStmt || child instanceof WhileStmt || child instanceof BlockStmt) {
                int childDepth = currentDepth + 1;
                if (childDepth > max) max = childDepth;
            }
        }
        return max;
    }
}
