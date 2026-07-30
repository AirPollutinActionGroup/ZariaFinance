package com.ngo.finance.donor.validator.annotation;

import com.ngo.finance.donor.validator.FundProfileValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Cross-field rules for a fund profile: a utilisation rule's other-rule-type
 * required only for OTHER_CUSTOM, the mandatory fields of each tranche
 * criterion's release type, and reminders only on human-actioned types.
 */
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = FundProfileValidator.class)
@Documented
public @interface ValidFundProfile {

    String message() default "Invalid fund profile configuration";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
