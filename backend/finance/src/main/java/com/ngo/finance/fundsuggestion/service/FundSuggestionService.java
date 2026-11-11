package com.ngo.finance.fundsuggestion.service;

import com.ngo.finance.budget.entity.Budget;
import com.ngo.finance.common.enums.ContributionType;
import com.ngo.finance.donor.FundingClassifier;
import com.ngo.finance.donor.entity.DonorFundProfile;
import com.ngo.finance.donor.entity.DonorMaster;
import com.ngo.finance.donor.entity.GrantAgreement;
import com.ngo.finance.donor.enums.GrantStatus;
import com.ngo.finance.fundsuggestion.dto.response.FundSuggestionResponse;
import com.ngo.finance.fundsuggestion.repository.FundSuggestionRepository;
import com.ngo.finance.outflow.service.OutflowScheduleService;
import com.ngo.finance.outflow.service.OutflowScheduleService.OutflowRow;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Suggests the donor → fund profile → grant a debit note could be charged to.
 * Advisory only: the user picks one (or none) on the form, and the debit note
 * service still checks the fund balance on save.
 *
 * <p>A fund is eligible when its donor is active and booked like the note
 * (LC / FC), it has money available (credit notes − debit notes), a
 * programme-tied fund matches the budget's programme, a fund limited to some
 * states includes the budget's state, and — when it has a grant — that grant
 * is active, not on hold or completed, and runs over the note date.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FundSuggestionService {

    static final int DEFAULT_LIMIT = 10;

    static final int MAX_LIMIT = 25;

    private static final int APPROVED = 1;

    private static final int PENDING = 2;

    private final FundSuggestionRepository repository;

    private final OutflowScheduleService outflowScheduleService;

    private final FundSuggestionWeightsService weightsService;

    public List<FundSuggestionResponse> suggestForDebitNote(String outflowLineId, BigDecimal amount, LocalDate date,
            ContributionType book, Integer limit) {
        OutflowRow row = outflowScheduleService.resolve(outflowLineId);
        Budget budget = row.budget();
        ContributionType noteBook = book != null ? book : row.line().getBook();
        LocalDate onDate = date != null ? date : LocalDate.now();
        BigDecimal wanted = amount != null && amount.signum() > 0 ? amount : null;
        Long programmeId = budget.getProgramme() == null ? null : budget.getProgramme().getId();
        Long stateId = budget.getState() == null ? null : budget.getState().getId();

        Map<String, BigDecimal> credits = sums(repository.sumCreditsByFundProfile());
        Map<String, BigDecimal> debits = sums(repository.sumDebitsByFundProfile());
        Map<String, Long> usesOnLine = counts(repository.countDebitsOnLineByFundProfile(row.line().getId()));
        Map<Long, List<GrantAgreement>> grantsByFund = repository.findGrantsWithFundProfile().stream()
                .collect(Collectors.groupingBy(g -> g.getFundProfile().getId()));

        List<FundCandidate> candidates = new ArrayList<>();
        for (DonorFundProfile profile : repository.findCandidateProfiles()) {
            DonorMaster donor = profile.getDonor();
            if (bookOf(donor) != noteBook) {
                continue;
            }
            Long fundProgrammeId = profile.getProgramme() == null ? null : profile.getProgramme().getId();
            if (Boolean.TRUE.equals(profile.getProgrammeTied()) && fundProgrammeId != null
                    && !fundProgrammeId.equals(programmeId)) {
                continue;
            }
            if (!spendableIn(profile, stateId)) {
                continue;
            }
            List<GrantAgreement> grants = grantsByFund.getOrDefault(profile.getId(), List.of());
            GrantAgreement grant = usableGrant(grants, onDate);
            if (!grants.isEmpty() && grant == null) {
                continue; // its grant has ended, is on hold, or doesn't cover the note date
            }
            String ref = String.valueOf(profile.getId());
            BigDecimal received = credits.getOrDefault(ref, BigDecimal.ZERO);
            BigDecimal debited = debits.getOrDefault(ref, BigDecimal.ZERO);
            if (received.subtract(debited).signum() <= 0) {
                continue;
            }
            candidates.add(new FundCandidate(
                    donor.getId(),
                    donor.getDonorName(),
                    profile.getId(),
                    fundProfileName(profile),
                    profile.getFundClass(),
                    grant == null ? null : grant.getId(),
                    grant == null ? null : grant.getGrantCode(),
                    grant == null ? null : grant.getAgreementName(),
                    grant == null ? null : grant.getEndDate(),
                    grant == null ? null : grant.getTotalGrantAmount(),
                    grant != null && !Objects.equals(grant.getIsApproved(), APPROVED),
                    received,
                    debited,
                    usesOnLine.getOrDefault(ref, 0L),
                    fundProgrammeId != null && fundProgrammeId.equals(programmeId)));
        }
        int max = limit == null || limit < 1 ? DEFAULT_LIMIT : Math.min(limit, MAX_LIMIT);
        return FundSuggestionRanker.rank(candidates, wanted, onDate, max, weightsService.current());
    }

    /** Same fallback as the Inflow Budget: an unset book follows FCRA / domicile. */
    private static ContributionType bookOf(DonorMaster donor) {
        if (donor.getBook() != null) {
            return donor.getBook();
        }
        return FundingClassifier.isForeign(donor) ? ContributionType.FC : ContributionType.LC;
    }

    /** A fund with no spendable states can be spent anywhere; so can any fund on a budget with no state. */
    private static boolean spendableIn(DonorFundProfile profile, Long stateId) {
        if (stateId == null || profile.getGeographies().isEmpty()) {
            return true;
        }
        return profile.getGeographies().stream()
                .anyMatch(g -> g.getState() != null && stateId.equals(g.getState().getId()));
    }

    /** The fund's grant that can take this note — approved over pending, then the one ending first. */
    private static GrantAgreement usableGrant(List<GrantAgreement> grants, LocalDate date) {
        return grants.stream()
                .filter(g -> g.getGrantStatus() == GrantStatus.ACTIVE && Boolean.TRUE.equals(g.getIsActive()))
                .filter(g -> Objects.equals(g.getIsApproved(), APPROVED) || Objects.equals(g.getIsApproved(), PENDING))
                .filter(g -> !date.isBefore(g.getStartDate()) && !date.isAfter(g.getEndDate()))
                .min(Comparator.comparing((GrantAgreement g) -> !Objects.equals(g.getIsApproved(), APPROVED))
                        .thenComparing(GrantAgreement::getEndDate))
                .orElse(null);
    }

    /** Matches the debit note form's fund profile label. */
    private static String fundProfileName(DonorFundProfile profile) {
        if (profile.getPurpose() != null && !profile.getPurpose().isBlank()) {
            return profile.getPurpose().trim();
        }
        String fundClass = profile.getFundClass() == null ? "Fund profile" : profile.getFundClass().getLabel();
        return fundClass + " · #" + profile.getId();
    }

    private static Map<String, BigDecimal> sums(List<Object[]> rows) {
        Map<String, BigDecimal> map = new HashMap<>();
        for (Object[] r : rows) {
            map.put((String) r[0], (BigDecimal) r[1]);
        }
        return map;
    }

    private static Map<String, Long> counts(List<Object[]> rows) {
        Map<String, Long> map = new HashMap<>();
        for (Object[] r : rows) {
            map.put((String) r[0], ((Number) r[1]).longValue());
        }
        return map;
    }
}
