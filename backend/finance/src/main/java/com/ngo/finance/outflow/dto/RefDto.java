package com.ngo.finance.outflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * An { id, name } snapshot of a master-data pick (payee, payment mode, bank
 * account, group, ledger, donor, fund profile, grant, tranche). The id is a
 * string because not every source is numeric; the name is what's displayed.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefDto {

    private String id;

    private String name;

    /** Null when the snapshot has no name (i.e. nothing was picked). */
    public static RefDto of(String id, String name) {
        return name == null ? null : new RefDto(id, name);
    }

    public static String idOf(RefDto ref) {
        return ref == null || ref.getId() == null || ref.getId().isBlank() ? null : ref.getId().trim();
    }

    public static String nameOf(RefDto ref) {
        return ref == null || ref.getName() == null || ref.getName().isBlank() ? null : ref.getName().trim();
    }
}
