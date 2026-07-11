package com.ngo.finance.donor.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One row of the utilisation-compliance report — a grant's committed / received /
 * utilised position against its fund-profile overhead cap.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UtilisationComplianceEntry {

    private String grantCode;
    private String donorName;
    private String fundClassCode;
    private BigDecimal overheadLimitPercent;
    private BigDecimal committed;
    private BigDecimal received;
    private BigDecimal utilised;
    private BigDecimal utilisationPercent; // utilised / committed
    private boolean compliant;             // utilised does not exceed committed
    private String note;
}
