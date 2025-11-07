package com.eventplatform.dto;

import com.eventplatform.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * User DTO
 * Data Transfer Object for user information (without password)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {

    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private String status;
    private String role;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    
    // Specific fields for different user types
    private String organizationName;  // For EventOrganizer
    private String permissions;       // For PlatformAdmin
    private String accessLevel;       // For PlatformAdmin

    /**
     * Convert User entity to UserDTO
     */
    public static UserDTO fromEntity(User user) {
        UserDTOBuilder builder = UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .status(user.getStatus().name())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .lastLogin(user.getLastLogin());

        // Add specific fields based on user type
        if (user instanceof com.eventplatform.model.EventOrganizer) {
            builder.organizationName(((com.eventplatform.model.EventOrganizer) user).getOrganizationName());
        } else if (user instanceof com.eventplatform.model.PlatformAdmin) {
            builder.permissions(((com.eventplatform.model.PlatformAdmin) user).getPermissions());
            builder.accessLevel(((com.eventplatform.model.PlatformAdmin) user).getAccessLevel());
        }

        return builder.build();
    }
}
