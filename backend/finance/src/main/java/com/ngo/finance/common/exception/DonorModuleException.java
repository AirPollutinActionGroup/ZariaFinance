package com.ngo.finance.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Base exception for donor module
 */
public class DonorModuleException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    private final HttpStatus status;

    public DonorModuleException(String message) {
        this(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    public DonorModuleException(String message, Throwable cause) {
        super(message, cause);
        this.status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    public DonorModuleException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}