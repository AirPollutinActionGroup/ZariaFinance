package com.ngo.finance.donation.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ngo.finance.donation.enums.BequestStatus;
import com.ngo.finance.donation.enums.EstateDomicile;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LegacyDetailResponse {
    private BequestStatus bequestStatus;
    private String probateReference;
    private BigDecimal expectedValue;
    private EstateDomicile estateDomicile;
}
