package com.ngo.finance.donor.validator;

import com.ngo.finance.donor.repository.DonorRepository;
import com.ngo.finance.donor.validator.annotation.UniqueDonorCode;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Validator to check if donor code is unique
 */
@Component
public class UniqueDonorCodeValidator implements ConstraintValidator<UniqueDonorCode, String> {

    @Autowired
    private DonorRepository donorRepository;

    @Override
    public void initialize(UniqueDonorCode constraintAnnotation) {
        // No initialization needed
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }
        return !donorRepository.findByDonorCode(value).isPresent();
    }
}
