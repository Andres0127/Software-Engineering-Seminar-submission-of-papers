package com.eventplatform.service;

import com.eventplatform.dto.UpdateUserRequest;
import com.eventplatform.dto.UserDTO;
import com.eventplatform.exception.ResourceNotFoundException;
import com.eventplatform.model.EventOrganizer;
import com.eventplatform.model.TicketBuyer;
import com.eventplatform.model.User;
import com.eventplatform.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private EventOrganizer testOrganizer;

    @BeforeEach
    void setUp() {
        testUser = new TicketBuyer();
        testUser.setId(1L);
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setPhoneNumber("+1234567890");
        testUser.setStatus(User.UserStatus.ACTIVE);
        testUser.setCreatedAt(LocalDateTime.now());

        testOrganizer = new EventOrganizer();
        testOrganizer.setId(2L);
        testOrganizer.setName("Organizer User");
        testOrganizer.setEmail("organizer@example.com");
        testOrganizer.setPhoneNumber("+9876543210");
        testOrganizer.setOrganizationName("Test Organization");
        testOrganizer.setStatus(User.UserStatus.ACTIVE);
        testOrganizer.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void testGetUserById_Success() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // Act
        UserDTO result = userService.getUserById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(testUser.getId(), result.getId());
        assertEquals(testUser.getName(), result.getName());
        assertEquals(testUser.getEmail(), result.getEmail());
        assertEquals(testUser.getPhoneNumber(), result.getPhoneNumber());
        assertEquals("ROLE_BUYER", result.getRole());

        verify(userRepository).findById(1L);
    }

    @Test
    void testGetUserById_NotFound() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            userService.getUserById(999L);
        });

        verify(userRepository).findById(999L);
    }

    @Test
    void testGetAllUsers_Success() {
        // Arrange
        List<User> users = Arrays.asList(testUser, testOrganizer);
        when(userRepository.findAll()).thenReturn(users);

        // Act
        List<UserDTO> result = userService.getAllUsers();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("ROLE_BUYER", result.get(0).getRole());
        assertEquals("ROLE_ORGANIZER", result.get(1).getRole());
        assertEquals("Test Organization", result.get(1).getOrganizationName());

        verify(userRepository).findAll();
    }

    @Test
    void testUpdateUser_Success() {
        // Arrange
        UpdateUserRequest request = new UpdateUserRequest();
        request.setName("Updated Name");
        request.setPhoneNumber("+1111111111");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        UserDTO result = userService.updateUser(1L, request);

        // Assert
        assertNotNull(result);
        verify(userRepository).findById(1L);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testUpdateUser_UpdateEmail() {
        // Arrange
        UpdateUserRequest request = new UpdateUserRequest();
        request.setEmail("newemail@example.com");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        UserDTO result = userService.updateUser(1L, request);

        // Assert
        assertNotNull(result);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testUpdateUser_UpdateOrganizerOrganizationName() {
        // Arrange
        UpdateUserRequest request = new UpdateUserRequest();
        request.setOrganizationName("New Organization Name");

        when(userRepository.findById(2L)).thenReturn(Optional.of(testOrganizer));
        when(userRepository.save(any(User.class))).thenReturn(testOrganizer);

        // Act
        UserDTO result = userService.updateUser(2L, request);

        // Assert
        assertNotNull(result);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testUpdateUser_NotFound() {
        // Arrange
        UpdateUserRequest request = new UpdateUserRequest();
        request.setName("Updated Name");

        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            userService.updateUser(999L, request);
        });

        verify(userRepository).findById(999L);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testDeleteUser_Success() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        userService.deleteUser(1L);

        // Assert
        verify(userRepository).findById(1L);
        verify(userRepository).save(any(User.class));
        assertEquals(User.UserStatus.DELETED, testUser.getStatus());
    }

    @Test
    void testDeleteUser_NotFound() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            userService.deleteUser(999L);
        });

        verify(userRepository).findById(999L);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testGetUserStatistics_Success() {
        // Arrange
        when(userRepository.count()).thenReturn(10L);
        when(userRepository.countByStatus(User.UserStatus.ACTIVE)).thenReturn(8L);
        when(userRepository.countByStatus(User.UserStatus.SUSPENDED)).thenReturn(2L);

        // Act
        Object statistics = userService.getUserStatistics();

        // Assert
        assertNotNull(statistics);
        verify(userRepository).count();
        verify(userRepository).countByStatus(User.UserStatus.ACTIVE);
        verify(userRepository).countByStatus(User.UserStatus.SUSPENDED);
    }
}

