package com.ngo.finance.donor.validator;

import com.ngo.finance.donor.dto.request.CreateGrantRequest;
import com.ngo.finance.donor.validator.annotation.ValidGrantDates;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validator to validate grant agreement dates
 */
public class GrantDateValidator implements ConstraintValidator<ValidGrantDates, CreateGrantRequest> {

    @Override
    public void initialize(ValidGrantDates constraintAnnotation) {
        // No initialization needed
    }

    @Override
    public boolean isValid(CreateGrantRequest value, ConstraintValidatorContext context) {
        if (value == null || value.getStartDate() == null || value.getEndDate() == null) {
            return true;
        }

        boolean isValid = value.getEndDate().isAfter(value.getStartDate());

        if (!isValid) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("End date must be after start date")
                    .addPropertyNode("endDate")
                    .addConstraintViolation();
        }

        return isValid;
    }
}
