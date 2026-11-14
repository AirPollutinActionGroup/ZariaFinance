package com.ngo.finance.employeeallocation.enums;

/** What happened to an allocation, as recorded in its history. */
public enum AllocationEvent {
    /** The allocation was added. */
    CREATED,
    /** An end date was set — the allocation stops counting after it. */
    ENDED,
    /** The allocation was deleted (e.g. made by mistake). */
    REMOVED
}
