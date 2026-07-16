package com.ngo.finance.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when login is attempted with a rejected account
 */
public class AccountRejectedException extends DonorModuleException {
    private static final long serialVersionUID = 1L;

    public AccountRejectedException(String message) {
        super(message, HttpStatus.FORBIDDEN);
    }
}