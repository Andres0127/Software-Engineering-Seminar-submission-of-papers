package com.eventplatform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Main Spring Boot Application Entry Point
 * Event Platform - Authentication Service
 * 
 * This service handles:
 * - User registration and authentication
 * - JWT token generation and validation
 * - User role management (Admin, Organizer, Buyer)
 * - User profile management
 * 
 * @author Event Platform Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableJpaAuditing
public class EventPlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(EventPlatformApplication.class, args);
        System.out.println("\n========================================");
        System.out.println("Event Platform Authentication Service");
        System.out.println("Server running on: http://localhost:8080");
        System.out.println("Swagger UI: http://localhost:8080/swagger-ui.html");
        System.out.println("API Docs: http://localhost:8080/api-docs");
        System.out.println("========================================\n");
    }
}
