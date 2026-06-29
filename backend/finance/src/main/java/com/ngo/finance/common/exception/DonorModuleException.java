package com.ngo.finance.common.exception;

/**
 * Base exception for donor module
 */
public class DonorModuleException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public DonorModuleException(String message) {
        super(message);
    }

    public DonorModuleException(String message, Throwable cause) {
        super(message, cause);
    }
}
