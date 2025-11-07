package com.eventplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Authentication Response DTO
 * Returned after successful login/registration
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private String tokenType = "Bearer";
    private Long userId;
    private String email;
    private String name;
    private String role;
    private Long expiresIn;  // Milliseconds

    public AuthResponse(String token, Long userId, String email, String name, String role, Long expiresIn) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.name = name;
        this.role = role;
        this.expiresIn = expiresIn;
        this.tokenType = "Bearer";
    }
}
