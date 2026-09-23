package com.ngo.finance.masters.donortype.dto.request;

import com.ngo.finance.common.enums.ContributionType;
import com.ngo.finance.common.enums.FundSourceDomicile;
import jakarta.validation.constraints.NotBlank;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for registering a new donor type. There is no manual code —
 * the auto-generated id is the stable identifier.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDonorTypeRequest {

    @NotBlank(message = "Donor type name is required")
    private String name;

    /** Defaults to active when omitted. */
    private Boolean status;

    /** Fund Source Domicile values allowed for donors of this type; empty means no restriction. */
    private Set<FundSourceDomicile> allowedFundSourceDomiciles;

    /** Contribution Type values allowed for donors of this type; empty means no restriction. */
    private Set<ContributionType> allowedContributionTypes;
}
