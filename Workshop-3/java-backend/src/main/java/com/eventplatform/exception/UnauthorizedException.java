package com.eventplatform.exception;

/**
 * Unauthorized Exception
 * Thrown when authentication fails
 */
public class UnauthorizedException extends RuntimeException {
    
    public UnauthorizedException(String message) {
        super(message);
    }
}
