package com.eventplatform.service;

import com.eventplatform.dto.UpdateUserRequest;
import com.eventplatform.dto.UserDTO;
import com.eventplatform.exception.ResourceNotFoundException;
import com.eventplatform.model.EventOrganizer;
import com.eventplatform.model.User;
import com.eventplatform.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * User Service
 * Handles user management operations
 */
@Service
@Transactional
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    /**
     * Get user by ID
     */
    public UserDTO getUserById(Long userId) {
        logger.info("Fetching user with ID: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return UserDTO.fromEntity(user);
    }

    /**
     * Get all users
     */
    public List<UserDTO> getAllUsers() {
        logger.info("Fetching all users");
        
        return userRepository.findAll().stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Update user
     */
    public UserDTO updateUser(Long userId, UpdateUserRequest request) {
        logger.info("Updating user with ID: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Update fields if provided
        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }

        // Update organization name for organizers
        if (user instanceof EventOrganizer && request.getOrganizationName() != null) {
            ((EventOrganizer) user).setOrganizationName(request.getOrganizationName());
        }

        user = userRepository.save(user);
        logger.info("User updated successfully: {}", user.getEmail());

        return UserDTO.fromEntity(user);
    }

    /**
     * Delete user (soft delete)
     */
    public void deleteUser(Long userId) {
        logger.info("Deleting user with ID: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setStatus(User.UserStatus.DELETED);
        userRepository.save(user);
        
        logger.info("User deleted successfully: {}", user.getEmail());
    }

    /**
     * Get user statistics
     */
    public Object getUserStatistics() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus(User.UserStatus.ACTIVE);
        long suspendedUsers = userRepository.countByStatus(User.UserStatus.SUSPENDED);

        return new Object() {
            public final long total = totalUsers;
            public final long active = activeUsers;
            public final long suspended = suspendedUsers;
        };
    }
}
