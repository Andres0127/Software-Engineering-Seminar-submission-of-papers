package com.eventplatform.service;

import com.eventplatform.dto.*;
import com.eventplatform.exception.DuplicateResourceException;
import com.eventplatform.exception.UnauthorizedException;
import com.eventplatform.model.*;
import com.eventplatform.repository.AuditLogRepository;
import com.eventplatform.repository.UserRepository;
import com.eventplatform.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Authentication Service
 * Handles user registration, login, and authentication
 */
@Service
@Transactional
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    /**
     * Register new user
     */
    public AuthResponse register(RegisterRequest request) {
        logger.info("Registering new user with email: {}", request.getEmail());

        // Check if email already exists
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists: " + request.getEmail());
        }

        // Create user based on type
        User user = createUserByType(request);
        
        // Encode password
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        // Save user
        user = userRepository.save(user);
        
        // Create audit log
        createAuditLog(user, "USER_REGISTER", "User registered successfully");

        // Generate JWT token
        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole());

        logger.info("User registered successfully: {}", user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .expiresIn(tokenProvider.getExpirationMs())
                .build();
    }

    /**
     * User login
     */
    public AuthResponse login(LoginRequest request) {
        logger.info("Login attempt for email: {}", request.getEmail());

        // Find user by email
        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        // Check if user is active
        if (user.getStatus() != User.UserStatus.ACTIVE) {
            throw new UnauthorizedException("User account is " + user.getStatus());
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // Create audit log
        createAuditLog(user, "USER_LOGIN", "User logged in successfully");

        // Generate JWT token
        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole());

        logger.info("User logged in successfully: {}", user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .expiresIn(tokenProvider.getExpirationMs())
                .build();
    }

    /**
     * Create user entity based on type
     */
    private User createUserByType(RegisterRequest request) {
        User user;

        switch (request.getUserType().toUpperCase()) {
            case "ADMIN":
                PlatformAdmin admin = new PlatformAdmin();
                admin.setPermissions(request.getPermissions());
                admin.setAccessLevel(request.getAccessLevel());
                user = admin;
                break;

            case "ORGANIZER":
                EventOrganizer organizer = new EventOrganizer();
                organizer.setOrganizationName(request.getOrganizationName());
                user = organizer;
                break;

            case "BUYER":
                user = new TicketBuyer();
                break;

            default:
                throw new IllegalArgumentException("Invalid user type: " + request.getUserType());
        }

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setStatus(User.UserStatus.ACTIVE);

        return user;
    }

    /**
     * Create audit log entry
     */
    private void createAuditLog(User user, String action, String details) {
        AuditLog auditLog = AuditLog.builder()
                .user(user)
                .action(action)
                .entity("User")
                .entityId(user.getId())
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();

        auditLogRepository.save(auditLog);
    }
}
