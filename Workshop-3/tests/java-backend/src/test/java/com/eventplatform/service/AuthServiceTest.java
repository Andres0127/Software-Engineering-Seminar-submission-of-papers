package com.eventplatform.service;

import com.eventplatform.dto.AuthResponse;
import com.eventplatform.dto.LoginRequest;
import com.eventplatform.dto.RegisterRequest;
import com.eventplatform.exception.DuplicateResourceException;
import com.eventplatform.exception.UnauthorizedException;
import com.eventplatform.model.AuditLog;
import com.eventplatform.model.TicketBuyer;
import com.eventplatform.model.User;
import com.eventplatform.repository.AuditLogRepository;
import com.eventplatform.repository.UserRepository;
import com.eventplatform.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User testUser;
    private String encodedPassword;

    @BeforeEach
    void setUp() {
        encodedPassword = "$2a$10$encodedPasswordHash";
        
        registerRequest = new RegisterRequest();
        registerRequest.setName("Test User");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPhoneNumber("+1234567890");
        registerRequest.setPassword("Test123!@");
        registerRequest.setUserType("BUYER");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("Test123!@");

        testUser = new TicketBuyer();
        testUser.setId(1L);
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setPhoneNumber("+1234567890");
        testUser.setPassword(encodedPassword);
        testUser.setStatus(User.UserStatus.ACTIVE);
    }

    @Test
    void testRegister_Success() {
        // Arrange
        when(userRepository.existsByEmailIgnoreCase(registerRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn(encodedPassword);
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(tokenProvider.generateToken(anyLong(), anyString(), anyString())).thenReturn("test-token");
        when(tokenProvider.getExpirationMs()).thenReturn(3600000L);

        // Act
        AuthResponse response = authService.register(registerRequest);

        // Assert
        assertNotNull(response);
        assertEquals("test-token", response.getToken());
        assertEquals(testUser.getId(), response.getUserId());
        assertEquals(testUser.getEmail(), response.getEmail());
        assertEquals(testUser.getName(), response.getName());
        assertEquals("ROLE_BUYER", response.getRole());
        assertEquals(3600000L, response.getExpiresIn());

        verify(userRepository).existsByEmailIgnoreCase(registerRequest.getEmail());
        verify(passwordEncoder).encode(registerRequest.getPassword());
        verify(userRepository).save(any(User.class));
        verify(tokenProvider).generateToken(anyLong(), anyString(), anyString());
        verify(auditLogRepository).save(any(AuditLog.class));
    }

    @Test
    void testRegister_DuplicateEmail() {
        // Arrange
        when(userRepository.existsByEmailIgnoreCase(registerRequest.getEmail())).thenReturn(true);

        // Act & Assert
        assertThrows(DuplicateResourceException.class, () -> {
            authService.register(registerRequest);
        });

        verify(userRepository).existsByEmailIgnoreCase(registerRequest.getEmail());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testRegister_Organizer() {
        // Arrange
        registerRequest.setUserType("ORGANIZER");
        registerRequest.setOrganizationName("Test Org");

        when(userRepository.existsByEmailIgnoreCase(registerRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn(encodedPassword);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(1L);
            return user;
        });
        when(tokenProvider.generateToken(anyLong(), anyString(), anyString())).thenReturn("test-token");
        when(tokenProvider.getExpirationMs()).thenReturn(3600000L);

        // Act
        AuthResponse response = authService.register(registerRequest);

        // Assert
        assertNotNull(response);
        assertEquals("ROLE_ORGANIZER", response.getRole());
    }

    @Test
    void testRegister_Admin() {
        // Arrange
        registerRequest.setUserType("ADMIN");
        registerRequest.setPermissions("ALL");
        registerRequest.setAccessLevel("SUPER_ADMIN");

        when(userRepository.existsByEmailIgnoreCase(registerRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn(encodedPassword);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(1L);
            return user;
        });
        when(tokenProvider.generateToken(anyLong(), anyString(), anyString())).thenReturn("test-token");
        when(tokenProvider.getExpirationMs()).thenReturn(3600000L);

        // Act
        AuthResponse response = authService.register(registerRequest);

        // Assert
        assertNotNull(response);
        assertEquals("ROLE_ADMIN", response.getRole());
    }

    @Test
    void testLogin_Success() {
        // Arrange
        when(userRepository.findByEmailIgnoreCase(loginRequest.getEmail()))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(loginRequest.getPassword(), encodedPassword)).thenReturn(true);
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(tokenProvider.generateToken(anyLong(), anyString(), anyString())).thenReturn("test-token");
        when(tokenProvider.getExpirationMs()).thenReturn(3600000L);

        // Act
        AuthResponse response = authService.login(loginRequest);

        // Assert
        assertNotNull(response);
        assertEquals("test-token", response.getToken());
        assertEquals(testUser.getId(), response.getUserId());
        assertEquals(testUser.getEmail(), response.getEmail());
        assertEquals(testUser.getName(), response.getName());

        verify(userRepository).findByEmailIgnoreCase(loginRequest.getEmail());
        verify(passwordEncoder).matches(loginRequest.getPassword(), encodedPassword);
        verify(userRepository).save(any(User.class));
        verify(tokenProvider).generateToken(anyLong(), anyString(), anyString());
        verify(auditLogRepository).save(any(AuditLog.class));
    }

    @Test
    void testLogin_UserNotFound() {
        // Arrange
        when(userRepository.findByEmailIgnoreCase(loginRequest.getEmail()))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UnauthorizedException.class, () -> {
            authService.login(loginRequest);
        });

        verify(userRepository).findByEmailIgnoreCase(loginRequest.getEmail());
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    void testLogin_InvalidPassword() {
        // Arrange
        when(userRepository.findByEmailIgnoreCase(loginRequest.getEmail()))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(loginRequest.getPassword(), encodedPassword)).thenReturn(false);

        // Act & Assert
        assertThrows(UnauthorizedException.class, () -> {
            authService.login(loginRequest);
        });

        verify(userRepository).findByEmailIgnoreCase(loginRequest.getEmail());
        verify(passwordEncoder).matches(loginRequest.getPassword(), encodedPassword);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testLogin_InactiveUser() {
        // Arrange
        testUser.setStatus(User.UserStatus.SUSPENDED);
        when(userRepository.findByEmailIgnoreCase(loginRequest.getEmail()))
                .thenReturn(Optional.of(testUser));

        // Act & Assert
        assertThrows(UnauthorizedException.class, () -> {
            authService.login(loginRequest);
        });

        verify(userRepository).findByEmailIgnoreCase(loginRequest.getEmail());
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }
}

