package com.ngo.finance.donation.dto.request;

import com.ngo.finance.donation.enums.BequestStatus;
import com.ngo.finance.donation.enums.EstateDomicile;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LegacyDetailRequest {

    @NotNull(message = "Bequest status is required")
    private BequestStatus bequestStatus;

    private String probateReference;

    private BigDecimal expectedValue;

    @NotNull(message = "Estate domicile is required")
    private EstateDomicile estateDomicile;
}
