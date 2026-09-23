package com.ngo.finance.inflowbudget.mapper;

import com.ngo.finance.common.enums.ContributionType;
import com.ngo.finance.donor.entity.DonorDisbursementRule;
import com.ngo.finance.donor.entity.DonorFundProfile;
import com.ngo.finance.donor.entity.DonorMaster;
import com.ngo.finance.donor.entity.DonorTrancheCriterion;
import com.ngo.finance.donor.FundingClassifier;
import com.ngo.finance.donor.enums.FundMode;
import com.ngo.finance.inflowbudget.dto.response.InflowBudgetLineResponse;
import com.ngo.finance.inflowbudget.entity.InflowReceipt;
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
 * the actual-receipt totals aggregated from its {@link InflowReceipt} rows.
 */
@Component
public class InflowBudgetMapper {

    public InflowBudgetLineResponse toResponse(DonorTrancheCriterion criterion, List<InflowReceipt> receipts) {
        DonorDisbursementRule rule = criterion.getDonorDisbursementRule();
        DonorFundProfile profile = rule.getFundProfile();
        DonorMaster donor = profile.getDonor();

        BigDecimal actualAmount = receipts.stream()
                .map(InflowReceipt::getReceivedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        LocalDate actualDate = receipts.stream()
                .map(InflowReceipt::getReceivedDate)
                .max(Comparator.naturalOrder())
                .orElse(null);
        // Latest non-blank variance reason wins, mirroring the prior single-field behaviour.
        String varianceReason = receipts.stream()
                .sorted(Comparator.comparing(InflowReceipt::getReceivedDate).reversed())
                .map(InflowReceipt::getVarianceReason)
                .filter(reason -> reason != null && !reason.isBlank())
                .findFirst()
                .orElse(null);

        return InflowBudgetLineResponse.builder()
                .id(criterion.getId())
                .line(buildLine(criterion, profile))
                .fundingSource(profile.getFundMode() != null ? profile.getFundMode().name() : FundMode.RESTRICTED.name())
                .donor(donor.getDonorName())
                .book(resolveBook(donor))
                .expectedDate(criterion.getExpectedReleaseDate())
                .expectedAmount(criterion.getAmountCriteria())
                .actualDate(actualDate)
                .actualAmount(receipts.isEmpty() ? null : actualAmount)
                .receiptRef(joinDetail(receipts, InflowReceipt::getBankReference))
                .receiptNo(joinDetail(receipts, InflowReceipt::getReceiptVoucherNo))
                .varianceReason(varianceReason)
                .build();
    }

    /** Joins each instalment's non-blank value, oldest first, for display — same "; "-joined shape the UI already expects. */
    private String joinDetail(List<InflowReceipt> receipts, java.util.function.Function<InflowReceipt, String> field) {
        String joined = receipts.stream()
                .sorted(Comparator.comparing(InflowReceipt::getReceivedDate))
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
