package com.ngo.finance.common.exception;

import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;

/**
 * Exception thrown for validation errors
 */
public class ValidationException extends DonorModuleException {
    private static final long serialVersionUID = 1L;
    private final Map<String, String> errors;

    public ValidationException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
        this.errors = new HashMap<>();
    }

    public ValidationException(String message, Map<String, String> errors) {
        super(message, HttpStatus.BAD_REQUEST);
        this.errors = errors;
    }

    public Map<String, String> getErrors() {
        return errors;
    }

    public void addError(String field, String message) {
        errors.put(field, message);
    }
}
