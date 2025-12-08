package com.eventplatform.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Home Controller
 * Provides information about the API at the root endpoint
 */
@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> home() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Event Platform - Authentication API");
        response.put("version", "1.0.0");
        response.put("status", "running");
        response.put("endpoints", Map.of(
            "swagger-ui", "/swagger-ui.html",
            "api-docs", "/api-docs",
            "health", "/health",
            "auth", "/api/auth"
        ));
        return ResponseEntity.ok(response);
    }
}



