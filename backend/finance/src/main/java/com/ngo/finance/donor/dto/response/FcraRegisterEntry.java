package com.ngo.finance.donor.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One row of the FCRA / foreign-contribution register (FC-4 style) — a foreign
 * donor's grant and its designated receiving account.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FcraRegisterEntry {

    private String donorCode;
    private String donorName;
    private String foreignFundSourceType;
    private String foreignCountryName;
    private String bankAccountRef;
    private String grantCode;
    private BigDecimal totalGrantAmount;    // always INR
}
