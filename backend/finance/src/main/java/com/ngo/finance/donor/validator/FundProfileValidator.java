package com.ngo.finance.donor.validator;

import com.ngo.finance.donor.dto.request.CreateFundProfileRequest;
import com.ngo.finance.donor.dto.request.CreateFundProfileRequest.DisbursementRuleItem;
import com.ngo.finance.donor.dto.request.CreateFundProfileRequest.ReleaseCriterionItem;
import com.ngo.finance.donor.dto.request.CreateFundProfileRequest.TrancheCriterionItem;
import com.ngo.finance.donor.dto.request.CreateFundProfileRequest.UtilisationRuleItem;
import com.ngo.finance.donor.enums.DisbursementType;
import com.ngo.finance.donor.enums.RestrictionRuleType;
import com.ngo.finance.donor.validator.annotation.ValidFundProfile;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.List;

/**
 * Validates the shape of a fund profile (Fund Profile workbook sheets 04-06).
 * Errors are attached to the offending path — e.g.
 * {@code disbursementRules[0].trancheCriteria[1].criteria[0].milestoneName} —
 * so the form can highlight the exact field rather than showing one generic
 * message.
 */
public class FundProfileValidator implements ConstraintValidator<ValidFundProfile, CreateFundProfileRequest> {

    @Override
    public boolean isValid(CreateFundProfileRequest value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }

        context.disableDefaultConstraintViolation();
        boolean valid = true;

        if (Boolean.TRUE.equals(value.getProgrammeTied()) && value.getProgrammeId() == null) {
            error(context, "Programme is required when Programme-tied is enabled", "programmeId");
            valid = false;
        }

        if (Boolean.TRUE.equals(value.getMovementAllowed())
                && !Boolean.TRUE.equals(value.getProgrammeTied())
                && isBlank(value.getPurpose())) {
            error(context, "Purpose is required when Movement allowed is enabled and Programme-tied is off",
                    "purpose");
            valid = false;
        }

        List<UtilisationRuleItem> utilisationRules = value.getUtilisationRules() == null
                ? List.of() : value.getUtilisationRules();
        for (int u = 0; u < utilisationRules.size(); u++) {
            valid = validateUtilisationRule(utilisationRules.get(u), context, u) && valid;
        }

        List<DisbursementRuleItem> disbursementRules = value.getDisbursementRules() == null
                ? List.of() : value.getDisbursementRules();
        if (disbursementRules.isEmpty()) {
            error(context, "A disbursement schedule is required", "disbursementRules");
            valid = false;
        }
        for (int d = 0; d < disbursementRules.size(); d++) {
            valid = validateDisbursementRule(disbursementRules.get(d), context, d) && valid;

            List<TrancheCriterionItem> tranches = disbursementRules.get(d).getTrancheCriteria() == null
                    ? List.of() : disbursementRules.get(d).getTrancheCriteria();
            for (int c = 0; c < tranches.size(); c++) {
                TrancheCriterionItem tranche = tranches.get(c);
                List<ReleaseCriterionItem> criteria = tranche.getCriteria() == null
                        ? List.of() : tranche.getCriteria();
                if (criteria.isEmpty()) {
                    error(context, "A tranche needs at least one release criterion",
                            "disbursementRules", d, "trancheCriteria", c, "criteria");
                    valid = false;
                }
                for (int i = 0; i < criteria.size(); i++) {
                    valid = validateCriterion(criteria.get(i), context, d, c, i) && valid;
                }
            }
        }

        return valid;
    }

    /** Total amount committed is always required; the release date only for a lump sum. */
    private boolean validateDisbursementRule(DisbursementRuleItem item, ConstraintValidatorContext context, int d) {
        boolean valid = true;
        if (item.getTotalAmount() == null) {
            error(context, "Total amount committed is required", "disbursementRules", d, "totalAmount");
            valid = false;
        }
        if (item.getDisbursementType() == DisbursementType.LUMP_SUM
                && item.getReceivingDate() == null) {
            error(context, "Expected release date is required", "disbursementRules", d, "receivingDate");
            valid = false;
        }
        return valid;
    }

    /** otherRuleType is required only when ruleType is the custom/"Other" option. */
    private boolean validateUtilisationRule(UtilisationRuleItem item, ConstraintValidatorContext context, int u) {
        if (item.getRuleType() == RestrictionRuleType.OTHER_CUSTOM && isBlank(item.getOtherRuleType())) {
            error(context, "Custom rule type is required", "utilisationRules", u, "otherRuleType");
            return false;
        }
        return true;
    }

    /** The "Additional Fields" each release criterion's type requires. */
    private boolean validateCriterion(ReleaseCriterionItem item, ConstraintValidatorContext context, int d, int c, int i) {
        if (item.getReleaseCriteria() == null) {
            return true; // @NotNull reports it
        }
        boolean valid = true;

        switch (item.getReleaseCriteria()) {
            case FIXED_DATE -> {
                if (item.getReleaseDate() == null) {
                    error(context, "Release date is required for a fixed-date criterion",
                            "disbursementRules", d, "trancheCriteria", c, "criteria", i, "releaseDate");
                    valid = false;
                }
            }
            case MILESTONE_BASED -> {
                if (isBlank(item.getMilestoneName())) {
                    error(context, "Milestone name is required",
                            "disbursementRules", d, "trancheCriteria", c, "criteria", i, "milestoneName");
                    valid = false;
                }
                if (item.getVerificationSignOffRoleId() == null && isBlank(item.getOtherVerificationSignOffRole())) {
                    error(context, "Verification sign-off role is required",
                            "disbursementRules", d, "trancheCriteria", c, "criteria", i, "verificationSignOffRole");
                    valid = false;
                }
            }
            case UTILISATION_THRESHOLD -> {
                if (item.getUtilisationPercentage() == null) {
                    error(context, "Utilisation % is required",
                            "disbursementRules", d, "trancheCriteria", c, "criteria", i, "utilisationPercentage");
                    valid = false;
                }
                if (item.getTriggerBasis() == null) {
                    error(context, "Trigger basis is required",
                            "disbursementRules", d, "trancheCriteria", c, "criteria", i, "triggerBasis");
                    valid = false;
                }
            }
            case OTHER -> {
                if (isBlank(item.getDescription())) {
                    error(context, "Description is required for an 'Other' criterion",
                            "disbursementRules", d, "trancheCriteria", c, "criteria", i, "description");
                    valid = false;
                }
            }
            default -> {
                // ON_SIGNING and the report/approval types carry no extra fields.
            }
        }

        valid = validateReminder(item, context, d, c, i) && valid;
        return valid;
    }

    /** Reminders chase a person; there is nobody to chase for a criterion nobody actions. */
    private boolean validateReminder(ReleaseCriterionItem item, ConstraintValidatorContext context, int d, int c, int i) {
        if (!Boolean.TRUE.equals(item.getRemindSomeone())) {
            return true;
        }
        boolean valid = true;

        if (!item.getReleaseCriteria().isHumanActioned()) {
            error(context,
                    "A reminder cannot be set on " + item.getReleaseCriteria().getLabel()
                            + " — it is not actioned by a person",
                    "disbursementRules", d, "trancheCriteria", c, "criteria", i, "remindSomeone");
            return false;
        }

        if (item.getResponsibleRoleId() == null && isBlank(item.getOtherResponsibleRole())) {
            error(context, "Responsible role is required",
                    "disbursementRules", d, "trancheCriteria", c, "criteria", i, "responsibleRole");
            valid = false;
        }
        if (item.getReminderLeadTime() == null) {
            error(context, "Reminder lead time is required",
                    "disbursementRules", d, "trancheCriteria", c, "criteria", i, "reminderLeadTime");
            valid = false;
        }
        return valid;
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    /**
     * Builds a violation at a nested path, emitted as one dotted property node
     * so a form library's setError lands on the exact input the user has to fix.
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
