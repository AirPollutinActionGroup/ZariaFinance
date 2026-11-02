package com.ngo.finance.fundsuggestion.service;

import com.ngo.finance.donor.enums.FundClass;
import com.ngo.finance.fundsuggestion.dto.response.FundSuggestionResponse;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;


final class FundSuggestionRanker {

    private static final NumberFormat INR = NumberFormat.getNumberInstance(Locale.of("en", "IN"));

    private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH);

    private FundSuggestionRanker() {
    }

    private record Scored(FundCandidate candidate, int score, List<String> reasons, List<String> warnings) {
    }

    static List<FundSuggestionResponse> rank(List<FundCandidate> candidates, BigDecimal amount, LocalDate date, int limit,
            RankingWeights w) {
        List<Scored> ranked = candidates.stream()
                .map(c -> score(c, amount, date, w))
                .sorted(Comparator.comparingInt(Scored::score).reversed()
                        .thenComparing(s -> s.candidate().available(), Comparator.reverseOrder())
                        .thenComparing(s -> s.candidate().fundProfileId()))
                .limit(limit)
                .toList();
        List<FundSuggestionResponse> out = new ArrayList<>(ranked.size());
        for (int i = 0; i < ranked.size(); i++) {
            out.add(toResponse(ranked.get(i), i + 1, amount));
        }
        return out;
    }

    private static Scored score(FundCandidate c, BigDecimal amount, LocalDate date, RankingWeights w) {
        int score = 0;
        List<String> reasons = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        boolean restricted = c.fundClass() == FundClass.CLASS_A_RESTRICTED;

        if (c.programmeMatch()) {
            score += w.programmeMatch();
            reasons.add(points("Same programme as the budget", w.programmeMatch()));
        }
        if (amount != null) {
            if (c.covers(amount)) {
                score += w.coversAmount();
                reasons.add(points("Covers the full amount", w.coversAmount()));
            } else {
                warnings.add("Covers ₹" + INR.format(c.available()) + " of ₹" + INR.format(amount));
            }
        }
        if (restricted && c.programmeMatch()) {
            score += w.restrictedForProgramme();
            reasons.add(points("Restricted for this programme", w.restrictedForProgramme()));
        }
        if (c.grantEndDate() != null) {
            int expiry = expiryPoints(date, c.grantEndDate(), w);
            score += expiry;
            reasons.add(expiry > 0
                    ? points("Grant ends " + DAY.format(c.grantEndDate()), expiry)
                    : "Grant ends " + DAY.format(c.grantEndDate()));
        }
        if (c.grantId() != null) {
            score += w.hasGrant();
            if (w.hasGrant() != 0) {
                reasons.add(points("Backed by grant " + c.grantCode(), w.hasGrant()));
            }
            if (c.grantPendingApproval()) {
                warnings.add("Grant approval is still pending");
            }
        } else {
            warnings.add("No grant agreement — balance is from receipts only");
        }
        if (c.fundClass() == FundClass.CLASS_B_UNRESTRICTED || c.fundClass() == FundClass.CLASS_C_UNRESTRICTED) {
            score += w.unrestricted();
            warnings.add(points("Unrestricted fund — kept for where nothing restricted fits", w.unrestricted()));
        }
        if (c.usesOnLine() > 0) {
            reasons.add("Used on this budget line before (" + c.usesOnLine() + (c.usesOnLine() == 1 ? " note)" : " notes)"));
        }
        return new Scored(c, score, reasons, warnings);
    }

    /** Full points for a grant ending on or before the note date, falling linearly to 0 at the window's end. */
    static int expiryPoints(LocalDate noteDate, LocalDate grantEnd, RankingWeights w) {
        long window = w.expiryWindowDays();
        long days = Math.max(0, ChronoUnit.DAYS.between(noteDate, grantEnd));
        if (days >= window) {
            return 0;
        }
        return (int) Math.round(w.expiryMax() * (window - days) / (double) window);
    }

    private static String points(String reason, int points) {
        return reason + " (" + (points > 0 ? "+" : "") + points + ")";
    }

    private static FundSuggestionResponse toResponse(Scored s, int rank, BigDecimal amount) {
        FundCandidate c = s.candidate();
        BigDecimal available = c.available();
        BigDecimal used = amount == null ? c.debited() : c.debited().add(amount);
        BigDecimal utilisation = c.received().signum() > 0
                ? used.multiply(BigDecimal.valueOf(100)).divide(c.received(), 1, RoundingMode.HALF_UP).min(BigDecimal.valueOf(100))
                : null;

        return FundSuggestionResponse.builder()
                .rank(rank)
                .score(s.score())
                .donorId(c.donorId())
                .donorName(c.donorName())
                .fundProfileId(c.fundProfileId())
                .fundProfileName(c.fundProfileName())
                .fundClass(c.fundClass() == null ? null : c.fundClass().name())
                .grantId(c.grantId())
                .grantCode(c.grantCode())
                .grantName(c.grantName())
                .grantEndDate(c.grantEndDate())
                .grantTotal(c.grantTotal())
                .received(c.received())
                .debited(c.debited())
                .available(available)
                .availableAfter(amount == null ? null : available.subtract(amount))
                .coversAmount(amount == null ? null : c.covers(amount))
                .utilisationAfterPct(utilisation)
                .usesOnLine(c.usesOnLine())
                .reasons(s.reasons())
                .warnings(s.warnings())
                .build();
    }
}
