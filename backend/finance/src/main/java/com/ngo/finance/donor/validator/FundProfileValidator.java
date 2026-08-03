package com.ngo.finance.donor.validator;

import com.ngo.finance.donor.dto.request.CreateFundProfileRequest;
import com.ngo.finance.donor.dto.request.CreateFundProfileRequest.DisbursementRuleItem;
import com.ngo.finance.donor.dto.request.CreateFundProfileRequest.ReleaseCriterionItem;
import com.ngo.finance.donor.dto.request.CreateFundProfileRequest.TrancheCriterionItem;
import com.ngo.finance.donor.dto.request.CreateFundProfileRequest.UtilisationRuleItem;
import com.ngo.finance.donor.enums.RestrictionRuleType;
import com.ngo.finance.donor.enums.VerificationRole;
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

        List<UtilisationRuleItem> utilisationRules = value.getUtilisationRules() == null
                ? List.of() : value.getUtilisationRules();
        for (int u = 0; u < utilisationRules.size(); u++) {
            valid = validateUtilisationRule(utilisationRules.get(u), context, u) && valid;
        }

        List<DisbursementRuleItem> disbursementRules = value.getDisbursementRules() == null
                ? List.of() : value.getDisbursementRules();
        for (int d = 0; d < disbursementRules.size(); d++) {
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
                if (item.getVerificationSignOffRole() == null) {
                    error(context, "Verification sign-off role is required",
                            "disbursementRules", d, "trancheCriteria", c, "criteria", i, "verificationSignOffRole");
                    valid = false;
                } else if (item.getVerificationSignOffRole() == VerificationRole.OTHER
                        && isBlank(item.getOtherVerificationSignOffRole())) {
                    error(context, "Custom verification role is required",
                            "disbursementRules", d, "trancheCriteria", c, "criteria", i, "otherVerificationSignOffRole");
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

        if (item.getResponsibleRole() == null) {
            error(context, "Responsible role is required",
                    "disbursementRules", d, "trancheCriteria", c, "criteria", i, "responsibleRole");
            valid = false;
        } else if (item.getResponsibleRole() == VerificationRole.OTHER
                && isBlank(item.getOtherResponsibleRole())) {
            error(context, "Custom responsible role is required",
                    "disbursementRules", d, "trancheCriteria", c, "criteria", i, "otherResponsibleRole");
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
