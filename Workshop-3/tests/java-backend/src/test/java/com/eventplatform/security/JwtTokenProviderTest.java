package com.eventplatform.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;
    private static final String TEST_SECRET = "testSecretKeyForJwtTokenProviderTesting123456789";
    private static final long TEST_EXPIRATION = 3600000L; // 1 hour

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(tokenProvider, "jwtSecret", TEST_SECRET);
        ReflectionTestUtils.setField(tokenProvider, "jwtExpirationMs", TEST_EXPIRATION);
        tokenProvider.init();
    }

    @Test
    void testGenerateToken_Success() {
        // Arrange
        Long userId = 1L;
        String email = "test@example.com";
        String role = "ROLE_BUYER";

        // Act
        String token = tokenProvider.generateToken(userId, email, role);

        // Assert
        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void testGetUserIdFromToken_Success() {
        // Arrange
        Long userId = 1L;
        String email = "test@example.com";
        String role = "ROLE_BUYER";
        String token = tokenProvider.generateToken(userId, email, role);

        // Act
        Long extractedUserId = tokenProvider.getUserIdFromToken(token);

        // Assert
        assertEquals(userId, extractedUserId);
    }

    @Test
    void testGetEmailFromToken_Success() {
        // Arrange
        Long userId = 1L;
        String email = "test@example.com";
        String role = "ROLE_BUYER";
        String token = tokenProvider.generateToken(userId, email, role);

        // Act
        String extractedEmail = tokenProvider.getEmailFromToken(token);

        // Assert
        assertEquals(email, extractedEmail);
    }

    @Test
    void testGetRoleFromToken_Success() {
        // Arrange
        Long userId = 1L;
        String email = "test@example.com";
        String role = "ROLE_ADMIN";
        String token = tokenProvider.generateToken(userId, email, role);

        // Act
        String extractedRole = tokenProvider.getRoleFromToken(token);

        // Assert
        assertEquals(role, extractedRole);
    }

    @Test
    void testValidateToken_ValidToken() {
        // Arrange
        Long userId = 1L;
        String email = "test@example.com";
        String role = "ROLE_BUYER";
        String token = tokenProvider.generateToken(userId, email, role);

        // Act
        boolean isValid = tokenProvider.validateToken(token);

        // Assert
        assertTrue(isValid);
    }

    @Test
    void testValidateToken_InvalidToken() {
        // Arrange
        String invalidToken = "invalid.token.here";

        // Act
        boolean isValid = tokenProvider.validateToken(invalidToken);

        // Assert
        assertFalse(isValid);
    }

    @Test
    void testValidateToken_EmptyToken() {
        // Act
        boolean isValid = tokenProvider.validateToken("");

        // Assert
        assertFalse(isValid);
    }

    @Test
    void testValidateToken_NullToken() {
        // Act
        boolean isValid = tokenProvider.validateToken(null);

        // Assert
        assertFalse(isValid);
    }

    @Test
    void testGetExpirationMs() {
        // Act
        long expiration = tokenProvider.getExpirationMs();

        // Assert
        assertEquals(TEST_EXPIRATION, expiration);
    }

    @Test
    void testTokenContainsCorrectClaims() {
        // Arrange
        Long userId = 1L;
        String email = "test@example.com";
        String role = "ROLE_ORGANIZER";
        String token = tokenProvider.generateToken(userId, email, role);

        // Act
        Long extractedUserId = tokenProvider.getUserIdFromToken(token);
        String extractedEmail = tokenProvider.getEmailFromToken(token);
        String extractedRole = tokenProvider.getRoleFromToken(token);

        // Assert
        assertEquals(userId, extractedUserId);
        assertEquals(email, extractedEmail);
        assertEquals(role, extractedRole);
    }
}

