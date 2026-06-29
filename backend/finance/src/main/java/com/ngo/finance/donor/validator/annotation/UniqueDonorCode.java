package com.ngo.finance.donor.validator.annotation;

import com.ngo.finance.donor.validator.UniqueDonorCodeValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Custom annotation to validate that donor code is unique
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = UniqueDonorCodeValidator.class)
@Documented
public @interface UniqueDonorCode {

    String message() default "Donor code already exists";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
