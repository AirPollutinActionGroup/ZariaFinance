package com.ngo.finance.donor.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One row of the FCRA / foreign-contribution register (FC-4 style) — a foreign
 * donor's grant, its designated receiving account and the realised INR value.
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
    private String grantCurrency;
    private BigDecimal totalGrantAmount;    // in donor currency
    private BigDecimal reportingAmountInr;  // locked INR value
    private BigDecimal receivedInr;         // realised so far
}
