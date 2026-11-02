package com.ngo.finance.outflow.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.ngo.finance.common.enums.ContributionType;
import com.ngo.finance.donor.enums.FundClass;
import com.ngo.finance.donor.enums.GrantStatus;
import com.ngo.finance.outflow.service.FundSuggestionRanker.Fund;
import com.ngo.finance.outflow.service.FundSuggestionRanker.Grant;
import com.ngo.finance.outflow.service.FundSuggestionRanker.Line;
import com.ngo.finance.outflow.service.FundSuggestionRanker.Result;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;

class FundSuggestionRankerTest {

    private static final LocalDate DATE = LocalDate.of(2026, 10, 7);
    private static final Long PROGRAMME = 1L;
    private static final Long OTHER_PROGRAMME = 2L;
    private static final Long STATE = 10L;

    private static Line line(String amount) {
        return new Line(ContributionType.LC, PROGRAMME, "Clean Air", STATE, "Delhi",
                amount == null ? null : new BigDecimal(amount), DATE);
    }

    private static Grant grant(LocalDate end) {
        return new Grant(1L, "GA-001", "Agreement", GrantStatus.ACTIVE, true, true, DATE.minusYears(1), end, new BigDecimal("100000"));
    }

    private static Fund fund(long id, Long programmeId, FundClass cls, String received, String debited) {
        return fund(id, ContributionType.LC, programmeId, false, Map.of(), cls, grant(DATE.plusYears(1)), received, debited);
    }

    private static Fund fund(long id, ContributionType book, Long programmeId, boolean tied, Map<Long, String> states,
                             FundClass cls, Grant grant, String received, String debited) {
        return new Fund(id, "Donor " + id, true, book, id, "Fund " + id, cls, programmeId,
                programmeId == null ? null : "Programme " + programmeId, tied, states, grant,
                new BigDecimal(received), new BigDecimal(debited));
    }

    @Test
    void leavesOutFundsThatCannotPay() {
        List<Fund> funds = List.of(
                fund(1, ContributionType.FC, PROGRAMME, false, Map.of(), null, null, "1000", "0"),
                fund(2, ContributionType.LC, OTHER_PROGRAMME, true, Map.of(), null, null, "1000", "0"),
                fund(3, ContributionType.LC, PROGRAMME, false, Map.of(20L, "Bihar"), null, null, "1000", "0"),
                fund(4, ContributionType.LC, PROGRAMME, false, Map.of(), null, null, "1000", "1000"),
                fund(5, ContributionType.LC, PROGRAMME, false, Map.of(), null, grant(DATE.minusDays(1)), "1000", "0"),
                fund(6, ContributionType.LC, PROGRAMME, false, Map.of(), null, null, "1000", "0"));

        Result result = FundSuggestionRanker.rank(line("500"), funds);

        assertThat(result.suggestions()).extracting(s -> s.fund().fundId()).containsExactly(6L);
        assertThat(result.excluded()).extracting(e -> e.reason()).containsExactly(
                "Booked FC — this note is LC",
                "Tied to Programme 2",
                "Can only be spent in Bihar",
                "Fully used — nothing left to charge",
                "Grant GA-001 ended on 6 Oct 2026");
    }

    @Test
    void ranksSameProgrammeRestrictedFundThatCoversTheAmountFirst() {
        List<Fund> funds = List.of(
                fund(1, OTHER_PROGRAMME, FundClass.CLASS_B_UNRESTRICTED, "9000", "0"),
                fund(2, PROGRAMME, FundClass.CLASS_B_UNRESTRICTED, "9000", "0"),
                fund(3, PROGRAMME, FundClass.CLASS_A_RESTRICTED, "9000", "0"),
                fund(4, PROGRAMME, FundClass.CLASS_A_RESTRICTED, "100", "0"));

        Result result = FundSuggestionRanker.rank(line("500"), funds);

        // 2 (unrestricted, covers it) and 4 (restricted, short) tie on 60 — the one with more available wins.
        assertThat(result.suggestions()).extracting(s -> s.fund().fundId()).containsExactly(3L, 2L, 4L, 1L);
        assertThat(result.suggestions().get(0).score()).isEqualTo(40 + 25 + 15 + 5);
        assertThat(result.suggestions().get(2).coversAmount()).isFalse();
        assertThat(result.suggestions().get(2).warnings()).contains("Covers only ₹100 of ₹500");
    }

    @Test
    void grantAboutToLapseRanksAboveOneWithTimeLeft() {
        Fund lapsing = fund(1, ContributionType.LC, PROGRAMME, false, Map.of(), null, grant(DATE.plusDays(10)), "1000", "0");
        Fund later = fund(2, ContributionType.LC, PROGRAMME, false, Map.of(), null, grant(DATE.plusYears(1)), "1000", "0");

        Result result = FundSuggestionRanker.rank(line(null), List.of(later, lapsing));

        assertThat(result.suggestions()).extracting(s -> s.fund().fundId()).containsExactly(1L, 2L);
        assertThat(result.suggestions().get(0).reasons()).anyMatch(r -> r.startsWith("Grant ends 17 Oct 2026"));
    }

    @Test
    void withoutAnAmountEveryFundCountsAsCovering() {
        Result result = FundSuggestionRanker.rank(line(null), List.of(fund(1, PROGRAMME, null, "10", "0")));

        assertThat(result.suggestions().get(0).coversAmount()).isTrue();
        assertThat(result.suggestions().get(0).reasons()).noneMatch(r -> r.startsWith("Covers"));
    }

    @Test
    void returnsAtMostTen() {
        List<Fund> funds = new ArrayList<>();
        IntStream.rangeClosed(1, 15).forEach(i -> funds.add(fund(i, PROGRAMME, null, String.valueOf(i * 100), "0")));

        Result result = FundSuggestionRanker.rank(line(null), funds);

        assertThat(result.suggestions()).hasSize(FundSuggestionRanker.MAX_SUGGESTIONS);
        // Equal scores → the most available first.
        assertThat(result.suggestions().get(0).fund().fundId()).isEqualTo(15L);
    }
}
