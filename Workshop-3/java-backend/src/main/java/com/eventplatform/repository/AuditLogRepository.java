package com.eventplatform.repository;

import com.eventplatform.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for Audit Log Entity
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    /**
     * Find audit logs by user ID
     */
    List<AuditLog> findByUserIdOrderByTimestampDesc(Long userId);

    /**
     * Find audit logs by action
     */
    List<AuditLog> findByActionOrderByTimestampDesc(String action);

    /**
     * Find audit logs within date range
     */
    List<AuditLog> findByTimestampBetweenOrderByTimestampDesc(
            LocalDateTime startDate, 
            LocalDateTime endDate
    );

    /**
     * Find recent audit logs (last N records)
     */
    List<AuditLog> findTop50ByOrderByTimestampDesc();
}
