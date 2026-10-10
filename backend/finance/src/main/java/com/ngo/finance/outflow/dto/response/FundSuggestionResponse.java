package com.ngo.finance.outflow.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Donor funds suggested for a debit note on one outflow row: the best few,
 * ranked (score out of 100, with reasons and warnings), plus every fund left
 * out and why.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FundSuggestionResponse {

    private String outflowLineId;

    private String book;

    /** Null when no amount was given — funds aren't scored on covering it. */
    private BigDecimal amount;

    private LocalDate date;

    private List<Item> suggestions;

    private List<Excluded> excluded;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Item {

        private int rank;

        private int score;

        private Long donorId;

        private String donorName;

        private Long fundProfileId;

        private String fundProfileName;

        private String fundClassLabel;

        private String programmeName;

        private Grant grant;

        private BigDecimal received;

        private BigDecimal debited;

        private BigDecimal available;

        /** Available once this note is charged; null when no amount was given. */
        private BigDecimal availableAfter;

        private boolean coversAmount;

        private List<String> reasons;

        private List<String> warnings;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Grant {

        private Long id;

        private String grantCode;

        private String agreementName;

        private LocalDate endDate;

        private BigDecimal totalGrantAmount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Excluded {

        private Long donorId;

        private String donorName;

        private Long fundProfileId;

        private String fundProfileName;

        private String reason;
    }
}
