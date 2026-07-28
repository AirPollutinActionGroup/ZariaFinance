package com.ngo.finance.donor.validator.annotation;

import com.ngo.finance.donor.validator.DisbursementScheduleValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Cross-field rules for a disbursement configuration: the lump-sum / tranches
 * shape, the mandatory fields of each criterion type, and reminders only on
 * human-actioned criteria.
 */
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = DisbursementScheduleValidator.class)
@Documented
public @interface ValidDisbursementSchedule {

    String message() default "Invalid disbursement configuration";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
