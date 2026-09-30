package com.ngo.finance.inflowbudget.mapper;

import com.ngo.finance.common.enums.ContributionType;
import com.ngo.finance.donor.entity.DonorDisbursementRule;
import com.ngo.finance.donor.entity.DonorFundProfile;
import com.ngo.finance.donor.entity.DonorMaster;
import com.ngo.finance.donor.entity.DonorTrancheCriterion;
import com.ngo.finance.donor.FundingClassifier;
import com.ngo.finance.donor.enums.FundMode;
import com.ngo.finance.inflowbudget.dto.response.InflowBudgetLineResponse;
import com.ngo.finance.outflow.entity.CreditNote;
import com.ngo.finance.programme.entity.Programme;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * Builds an {@link InflowBudgetLineResponse} from a donor tranche criterion,
 * deriving the funding source, donor name, book and a human-readable line
 * description from its disbursement rule / fund profile / donor chain, plus
 * what was received — the credit notes received against the line.
 */
@Component
public class InflowBudgetMapper {

    private static final Comparator<CreditNote> OLDEST_FIRST =
            Comparator.comparing(CreditNote::getNoteDate).thenComparing(CreditNote::getNoteCode);

    public InflowBudgetLineResponse toResponse(DonorTrancheCriterion criterion, List<CreditNote> creditNotes) {
        DonorDisbursementRule rule = criterion.getDonorDisbursementRule();
        DonorFundProfile profile = rule.getFundProfile();
        DonorMaster donor = profile.getDonor();

        List<CreditNote> received = creditNotes.stream().sorted(OLDEST_FIRST).toList();
        BigDecimal actualAmount = received.stream()
                .map(CreditNote::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        LocalDate actualDate = received.isEmpty() ? null : received.get(received.size() - 1).getNoteDate();

        return InflowBudgetLineResponse.builder()
                .id(criterion.getId())
                .line(buildLine(criterion, profile))
                .fundingSource(profile.getFundMode() != null ? profile.getFundMode().name() : FundMode.RESTRICTED.name())
                .donor(donor.getDonorName())
                .book(resolveBook(donor))
                .expectedDate(criterion.getExpectedReleaseDate())
                .expectedAmount(criterion.getAmountCriteria())
                .actualDate(actualDate)
                .actualAmount(received.isEmpty() ? null : actualAmount)
                .receiptRef(joinDetail(received, CreditNote::getReference))
                .receiptNo(joinDetail(received, CreditNote::getNoteCode))
                .receipts(received.stream()
                        .map(n -> InflowBudgetLineResponse.ReceiptItem.builder()
                                .date(n.getNoteDate())
                                .amount(n.getAmount())
                                .reference(n.getReference())
                                .creditNoteId(n.getNoteCode())
                                .build())
                        .toList())
                .build();
    }

    /** Joins each instalment's non-blank value, oldest first, for display — "; "-joined. */
    private String joinDetail(List<CreditNote> received, java.util.function.Function<CreditNote, String> field) {
        String joined = received.stream()
                .map(field)
                .filter(value -> value != null && !value.isBlank())
                .reduce((a, b) -> a + "; " + b)
                .orElse(null);
        return joined;
    }

    private String buildLine(DonorTrancheCriterion criterion, DonorFundProfile profile) {
        Programme programme = profile.getProgramme();
        String subject = programme != null ? programme.getProgrammeName() : profile.getDonor().getDonorName();
        return Boolean.TRUE.equals(criterion.getIsFinalTranche())
                ? "Final tranche — " + subject
                : "Grant tranche — " + subject;
    }

    private String resolveBook(DonorMaster donor) {
        if (donor.getBook() != null) {
            return donor.getBook().getShortName();
        }
        return FundingClassifier.isForeign(donor) ? ContributionType.FC.getShortName() : ContributionType.LC.getShortName();
    }
}
