package com.ngo.finance.outflow.service;

import com.ngo.finance.budget.entity.Budget;
import com.ngo.finance.common.enums.ContributionType;
import com.ngo.finance.donor.FundingClassifier;
import com.ngo.finance.donor.entity.DonorFundProfile;
import com.ngo.finance.donor.entity.DonorMaster;
import com.ngo.finance.donor.entity.GrantAgreement;
import com.ngo.finance.donor.entity.SpendableGeography;
import com.ngo.finance.donor.enums.GrantStatus;
import com.ngo.finance.donor.repository.DonorFundProfileRepository;
import com.ngo.finance.donor.repository.GrantRepository;
import com.ngo.finance.outflow.dto.response.FundSuggestionResponse;
import com.ngo.finance.outflow.service.FundBalanceService.FundBalance;
import com.ngo.finance.outflow.service.FundSuggestionRanker.Fund;
import com.ngo.finance.outflow.service.FundSuggestionRanker.Grant;
import com.ngo.finance.outflow.service.FundSuggestionRanker.Line;
import com.ngo.finance.outflow.service.FundSuggestionRanker.Result;
import com.ngo.finance.outflow.service.FundSuggestionRanker.Suggestion;
import com.ngo.finance.outflow.service.OutflowScheduleService.OutflowRow;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Suggests which donor fund a debit note on an outflow row should be charged
 * to. Gathers each fund profile's donor, grant and balance, and leaves the
 * ranking to {@link FundSuggestionRanker}. Suggestions never pick for the
 * user — the debit note form shows them and the user chooses.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FundSuggestionService {

    private final OutflowScheduleService outflowScheduleService;

    private final DonorFundProfileRepository fundProfileRepository;

    private final GrantRepository grantRepository;

    private final FundBalanceService fundBalanceService;

    /**
     * @param amount the note's amount, or null if not entered yet
     * @param date   the note's date; today when null
     * @param book   the note's book; the row's book when null
     */
    public FundSuggestionResponse suggest(String outflowLineId, BigDecimal amount, LocalDate date, ContributionType book) {
        OutflowRow row = NoteRules.resolveRowForNote(outflowScheduleService, outflowLineId);
        Budget budget = row.budget();
        Line line = new Line(
                book != null ? book : row.line().getBook(),
                budget.getProgramme() != null ? budget.getProgramme().getId() : null,
                budget.getProgramme() != null ? budget.getProgramme().getProgrammeName() : null,
                budget.getState() != null ? budget.getState().getId() : null,
                budget.getState() != null ? budget.getState().getStateName() : null,
                amount != null && amount.signum() > 0 ? amount : null,
                date != null ? date : LocalDate.now());

        Map<Long, GrantAgreement> grants = grantsByFundProfile();
        Map<String, FundBalance> balances = fundBalanceService.balancesByFund();
        List<Fund> funds = new ArrayList<>();
        for (DonorFundProfile profile : fundProfileRepository.findAllByOrderByIdAsc()) {
            funds.add(toFund(profile, grants.get(profile.getId()),
                    balances.getOrDefault(String.valueOf(profile.getId()), FundBalance.EMPTY)));
        }

        Result result = FundSuggestionRanker.rank(line, funds);
        List<FundSuggestionResponse.Item> items = new ArrayList<>();
        for (Suggestion s : result.suggestions()) {
            items.add(toItem(items.size() + 1, s, line.amount()));
        }
        return FundSuggestionResponse.builder()
                .outflowLineId(row.id())
                .book(line.book().name())
                .amount(line.amount())
                .date(line.date())
                .suggestions(items)
                .excluded(result.excluded().stream()
                        .map(e -> FundSuggestionResponse.Excluded.builder()
                                .donorId(e.fund().donorId())
                                .donorName(e.fund().donorName())
                                .fundProfileId(e.fund().fundId())
                                .fundProfileName(e.fund().fundName())
                                .reason(e.reason())
                                .build())
                        .toList())
                .build();
    }

    /** A fund profile backs at most one live grant; if there are several, prefer the active, then the newest. */
    private Map<Long, GrantAgreement> grantsByFundProfile() {
        Comparator<GrantAgreement> preferred = Comparator
                .comparing((GrantAgreement g) -> g.getGrantStatus() == GrantStatus.ACTIVE && Boolean.TRUE.equals(g.getIsActive()))
                .thenComparing(GrantAgreement::getId);
        Map<Long, GrantAgreement> byProfile = new HashMap<>();
        for (GrantAgreement grant : grantRepository.findAll()) {
            if (grant.getFundProfile() == null) {
                continue;
            }
            byProfile.merge(grant.getFundProfile().getId(), grant, (a, b) -> preferred.compare(a, b) >= 0 ? a : b);
        }
        return byProfile;
    }

    private static Fund toFund(DonorFundProfile profile, GrantAgreement grant, FundBalance balance) {
        DonorMaster donor = profile.getDonor();
        Map<Long, String> states = new LinkedHashMap<>();
        for (SpendableGeography geo : profile.getGeographies()) {
            if (geo.getState() != null) {
                states.put(geo.getState().getId(), geo.getState().getStateName());
            }
        }
        return new Fund(
                donor.getId(),
                donor.getDonorName(),
                !Boolean.FALSE.equals(donor.getIsActive()),
                FundingClassifier.bookOf(donor),
                profile.getId(),
                fundProfileName(profile),
                profile.getFundClass(),
                profile.getProgramme() != null ? profile.getProgramme().getId() : null,
                profile.getProgramme() != null ? profile.getProgramme().getProgrammeName() : null,
                Boolean.TRUE.equals(profile.getProgrammeTied()),
                states,
                grant == null ? null : new Grant(
                        grant.getId(),
                        grant.getGrantCode(),
                        grant.getAgreementName(),
                        grant.getGrantStatus(),
                        !Boolean.FALSE.equals(grant.getIsActive()),
                        Integer.valueOf(1).equals(grant.getIsApproved()),
                        grant.getStartDate(),
                        grant.getEndDate(),
                        grant.getTotalGrantAmount()),
                balance.received(),
                balance.debited());
    }

    /** Same label the debit note form shows in its Fund profile picker. */
    private static String fundProfileName(DonorFundProfile profile) {
        if (profile.getPurpose() != null && !profile.getPurpose().isBlank()) {
            return profile.getPurpose().trim();
        }
        String cls = profile.getFundClass() != null ? profile.getFundClass().getLabel() : "Fund profile";
        return cls + " · #" + profile.getId();
    }

    private static FundSuggestionResponse.Item toItem(int rank, Suggestion s, BigDecimal amount) {
        Fund fund = s.fund();
        Grant grant = fund.grant();
        return FundSuggestionResponse.Item.builder()
                .rank(rank)
                .score(s.score())
                .donorId(fund.donorId())
                .donorName(fund.donorName())
                .fundProfileId(fund.fundId())
                .fundProfileName(fund.fundName())
                .fundClassLabel(fund.fundClass() != null ? fund.fundClass().getLabel() : null)
                .programmeName(fund.programmeName())
                .grant(grant == null ? null : FundSuggestionResponse.Grant.builder()
                        .id(grant.id())
                        .grantCode(grant.code())
                        .agreementName(grant.name())
                        .endDate(grant.endDate())
                        .totalGrantAmount(grant.total())
                        .build())
                .received(fund.received())
                .debited(fund.debited())
                .available(fund.available())
                .availableAfter(amount != null ? fund.available().subtract(amount) : null)
                .coversAmount(s.coversAmount())
                .reasons(s.reasons())
                .warnings(s.warnings())
                .build();
    }
}
