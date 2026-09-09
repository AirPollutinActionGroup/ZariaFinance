package com.ngo.finance.programme;

/**
 * The Programme classification values — a Project always has a parent
 * Programme; a Programme never does. Shared between request validation and
 * the service layer so the allowed set is defined exactly once.
 */
public final class ProgrammeTypes {

    public static final String PROGRAMME = "Programme";
    public static final String PROJECT = "Project";

    /** Bean Validation {@code @Pattern} regexp listing every allowed value. */
    public static final String PATTERN = "Programme|Project";

    private ProgrammeTypes() {
    }
}
