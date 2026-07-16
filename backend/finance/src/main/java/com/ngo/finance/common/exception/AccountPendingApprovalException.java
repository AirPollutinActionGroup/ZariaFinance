package com.ngo.finance.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when login is attempted with an account still pending
 * approval
 */
public class AccountPendingApprovalException extends DonorModuleException {
    private static final long serialVersionUID = 1L;

    public AccountPendingApprovalException(String message) {
        super(message, HttpStatus.FORBIDDEN);
    }
}