package com.eventplatform.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Ticket Buyer Entity
 * Represents regular users who purchase event tickets
 */
@Entity
@DiscriminatorValue("TicketBuyer")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class TicketBuyer extends User {

    @Override
    public String getRole() {
        return "ROLE_BUYER";
    }
}
