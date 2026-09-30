package com.ngo.finance.outflow.service;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.outflow.dto.RefDto;
import com.ngo.finance.outflow.service.OutflowScheduleService.OutflowRow;

/** Small rules shared by the debit and credit note services. */
final class NoteRules {

    private NoteRules() {
    }

    /** An unknown row on a note request is a bad request, not a missing page. */
    static OutflowRow resolveRowForNote(OutflowScheduleService schedule, String rowId) {
        try {
            return schedule.resolve(rowId);
        } catch (ResourceNotFoundException e) {
            throw new ValidationException(e.getMessage());
        }
    }

    static void requirePicked(RefDto ref, String message) {
        if (RefDto.nameOf(ref) == null) {
            throw new ValidationException(message);
        }
    }

    static void requireDonorForFund(RefDto donor, RefDto fundProfile) {
        if (RefDto.nameOf(fundProfile) != null && RefDto.nameOf(donor) == null) {
            throw new ValidationException("A fund profile needs its donor");
        }
    }

    static String actor(String value) {
        String trimmed = trimToNull(value);
        return trimmed == null ? "System" : trimmed;
    }

    static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
