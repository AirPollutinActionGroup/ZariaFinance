package com.ngo.finance.donor.validator;

import com.ngo.finance.donor.dto.request.DisbursementScheduleRequest;
import com.ngo.finance.donor.dto.request.DisbursementScheduleRequest.CriterionItem;
import com.ngo.finance.donor.dto.request.DisbursementScheduleRequest.TrancheItem;
import com.ngo.finance.donor.enums.DisbursementType;
import com.ngo.finance.donor.validator.annotation.ValidDisbursementSchedule;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.List;

/**
 * Validates the shape of a disbursement configuration (Disbursement Rules §1, §4,
 * §5). Errors are attached to the offending path — e.g.
 * {@code tranches[1].criteria[0].milestoneName} — so the form can highlight the
 * exact field rather than showing one generic message.
 */
public class DisbursementScheduleValidator
        implements ConstraintValidator<ValidDisbursementSchedule, DisbursementScheduleRequest> {

    @Override
    public boolean isValid(DisbursementScheduleRequest value, ConstraintValidatorContext context) {
        if (value == null || value.getDisbursementType() == null) {
            return true; // @NotNull reports the missing type
        }

        context.disableDefaultConstraintViolation();
        boolean valid = validateShape(value, context);

        List<TrancheItem> tranches = value.getTranches() == null ? List.of() : value.getTranches();
        for (int t = 0; t < tranches.size(); t++) {
            List<CriterionItem> criteria = tranches.get(t).getCriteria() == null
                    ? List.of() : tranches.get(t).getCriteria();
            if (criteria.isEmpty()) {
                error(context, "A tranche needs at least one release criterion",
                        "tranches", t, "criteria");
                valid = false;
            }
            for (int c = 0; c < criteria.size(); c++) {
                valid = validateCriterion(criteria.get(c), context, t, c) && valid;
            }
        }
        return valid;
    }

    /** Lump sum: one dated tranche, no cadence. Tranches: a cadence, no single date. */
    private boolean validateShape(DisbursementScheduleRequest value, ConstraintValidatorContext context) {
        boolean valid = true;
        int trancheCount = value.getTranches() == null ? 0 : value.getTranches().size();
        // Referenced by the lump-sum branch below.

        if (value.getDisbursementType() == DisbursementType.LUMP_SUM) {
            if (value.getReceivingDate() == null) {
                error(context, "Receiving date is required for a lump sum", "receivingDate");
                valid = false;
            }
            if (value.getScheduleType() != null) {
                error(context, "A lump sum has no schedule type", "scheduleType");
                valid = false;
            }
            if (trancheCount > 1) {
                error(context, "A lump sum is a single release", "tranches");
                valid = false;
            }
        } else {
            if (value.getScheduleType() == null) {
                error(context, "Schedule type is required for tranches", "scheduleType");
                valid = false;
            }
            if (value.getReceivingDate() != null) {
                error(context, "Receiving date applies to a lump sum only", "receivingDate");
                valid = false;
            }
            // Zero tranches is a legitimate draft: the user picks Tranches and a
            // cadence, saves, then adds tranches or copies the fund profile's plan.
            // "At least one tranche" is enforced at finalisation instead.
        }
        return valid;
    }

    /** The "Additional Fields" each criterion type requires. */
    private boolean validateCriterion(CriterionItem item, ConstraintValidatorContext context, int t, int c) {
        if (item.getCriterionType() == null) {
            return true; // @NotNull reports it
        }
        boolean valid = true;

        switch (item.getCriterionType()) {
            case FIXED_DATE -> {
                if (item.getReleaseDate() == null) {
                    error(context, "Release date is required for a fixed-date criterion",
                            "tranches", t, "criteria", c, "releaseDate");
                    valid = false;
                }
            }
            case MILESTONE_BASED -> {
                if (isBlank(item.getMilestoneName())) {
                    error(context, "Milestone name is required",
                            "tranches", t, "criteria", c, "milestoneName");
                    valid = false;
                }
                if (item.getVerificationRole() == null) {
                    error(context, "Verification sign-off role is required",
                            "tranches", t, "criteria", c, "verificationRole");
                    valid = false;
                }
            }
            case UTILISATION_THRESHOLD -> {
                if (item.getUtilisationPercent() == null) {
                    error(context, "Utilisation % is required",
                            "tranches", t, "criteria", c, "utilisationPercent");
                    valid = false;
                }
                if (item.getTriggerBasis() == null) {
                    error(context, "Trigger basis is required",
                            "tranches", t, "criteria", c, "triggerBasis");
                    valid = false;
                }
            }
            case OTHER -> {
                if (isBlank(item.getDescription())) {
                    error(context, "Description is required for an 'Other' criterion",
                            "tranches", t, "criteria", c, "description");
                    valid = false;
                }
            }
            default -> {
                // ON_SIGNING and the report/approval types carry no extra fields.
            }
        }

        // Reminders chase a person; there is nobody to chase for an automatic or
        // instant criterion, so configuring one would silently never fire.
        if (item.getReminder() != null && !item.getCriterionType().isHumanActioned()) {
            error(context,
                    "A reminder cannot be set on " + item.getCriterionType().getLabel()
                            + " — it is not actioned by a person",
                    "tranches", t, "criteria", c, "reminder");
            valid = false;
        }
        return valid;
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    /**
     * Builds a violation at a nested path, emitted as one dotted property node
     * (e.g. {@code tranches.1.criteria.0.milestoneName}). That is the shape React
     * Hook Form's setError takes, so the error lands on the exact input the user
     * has to fix rather than on the form as a whole.
     */
    private void error(ConstraintValidatorContext context, String message, Object... path) {
        StringBuilder property = new StringBuilder();
        for (Object segment : path) {
            if (!property.isEmpty()) {
                property.append('.');
            }
            property.append(segment);
        }
        context.buildConstraintViolationWithTemplate(message)
                .addPropertyNode(property.toString())
                .addConstraintViolation();
    }
}
