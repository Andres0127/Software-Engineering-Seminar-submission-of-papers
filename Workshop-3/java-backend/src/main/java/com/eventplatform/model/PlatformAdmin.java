package com.eventplatform.model;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Platform Administrator Entity
 * Represents system administrators with full access to the platform
 */
@Entity
@DiscriminatorValue("PlatformAdmin")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class PlatformAdmin extends User {

    @Column(columnDefinition = "TEXT")
    private String permissions;

    @Column(name = "access_level", length = 50)
    private String accessLevel;

    @Override
    public String getRole() {
        return "ROLE_ADMIN";
    }

    /**
     * Check if admin has super admin privileges
     */
    public boolean isSuperAdmin() {
        return "SUPER_ADMIN".equals(accessLevel);
    }
}
