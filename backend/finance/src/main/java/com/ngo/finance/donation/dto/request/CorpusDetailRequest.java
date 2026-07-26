package com.ngo.finance.donation.dto.request;

import com.ngo.finance.donation.enums.InvestmentMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CorpusDetailRequest {

    @NotBlank(message = "Written direction reference is required")
    private String writtenDirectionRef;

    @NotNull(message = "Direction date is required")
    private LocalDate directionDate;

    @NotBlank(message = "Direction document is required")
    private String directionDocumentPath;

    @NotNull(message = "Investment mode is required")
    private InvestmentMode investmentMode;
}
