package com.eventplatform.model;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Event Organizer Entity
 * Represents users who create and manage events
 */
@Entity
@DiscriminatorValue("EventOrganizer")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class EventOrganizer extends User {

    @Size(max = 150, message = "Organization name must not exceed 150 characters")
    @Column(name = "organization_name", length = 150)
    private String organizationName;

    @Override
    public String getRole() {
        return "ROLE_ORGANIZER";
    }
}
