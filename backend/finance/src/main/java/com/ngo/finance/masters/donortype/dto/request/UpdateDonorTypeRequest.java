package com.ngo.finance.masters.donortype.dto.request;

import com.ngo.finance.common.enums.ContributionType;
import com.ngo.finance.common.enums.FundSourceDomicile;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating a donor type. There is no editable code — the
 * id is the stable identifier donor records and business rules key off.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDonorTypeRequest {

    private String name;

    private Set<FundSourceDomicile> allowedFundSourceDomiciles;

    private Set<ContributionType> allowedContributionTypes;
}
