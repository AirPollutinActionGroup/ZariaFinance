package com.ngo.finance.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when login is attempted with invalid credentials
 */
public class InvalidCredentialsException extends DonorModuleException {
    private static final long serialVersionUID = 1L;

    public InvalidCredentialsException(String message) {
        super(message, HttpStatus.UNAUTHORIZED);
    }
}
