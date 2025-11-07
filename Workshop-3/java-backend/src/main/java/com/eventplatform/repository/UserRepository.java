package com.eventplatform.repository;

import com.eventplatform.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for User Entity
 * Provides database access methods for all user types
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find user by email (case-insensitive)
     */
    Optional<User> findByEmailIgnoreCase(String email);

    /**
     * Check if email exists
     */
    boolean existsByEmailIgnoreCase(String email);

    /**
     * Find user by email and status
     */
    Optional<User> findByEmailAndStatus(String email, User.UserStatus status);

    /**
     * Count users by status
     */
    long countByStatus(User.UserStatus status);

    /**
     * Custom query to get user with role
     */
    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmailWithRole(@Param("email") String email);
}
