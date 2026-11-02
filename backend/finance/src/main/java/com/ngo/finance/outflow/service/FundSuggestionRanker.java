package com.ngo.finance.outflow.service;

import com.ngo.finance.common.enums.ContributionType;
import com.ngo.finance.donor.enums.FundClass;
import com.ngo.finance.donor.enums.GrantStatus;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

/**
 * Ranks donor funds for a debit note. Pure — takes plain facts, touches no
 * repositories — so the rules can be tested on their own.
 *
 * <p>A fund is left out when it can't lawfully or practically pay: other book
 * (LC / FC), inactive donor, closed or out-of-dates grant, tied to another
 * programme, outside its spendable states, or nothing available. The rest are
 * scored out of 100 — same programme, covers the amount, restricted money for
 * this programme, grant about to lapse, backed by a grant — and the best
 * {@value #MAX_SUGGESTIONS} are returned.
 */
final class FundSuggestionRanker {

    static final int MAX_SUGGESTIONS = 10;

    static final int PROGRAMME_MATCH = 40;
    static final int COVERS_AMOUNT = 25;
    static final int RESTRICTED_FOR_PROGRAMME = 15;
    static final int EXPIRY_MAX = 15;
    static final int HAS_GRANT = 5;
    static final int UNRESTRICTED = -10;

    /** A grant ending within this many days of the note gets the expiry bonus, more the sooner it ends. */
    static final int EXPIRY_WINDOW_DAYS = 90;

    private static final NumberFormat INR = NumberFormat.getNumberInstance(Locale.of("en", "IN"));
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH);

    private FundSuggestionRanker() {
    }

    /** What the note is for. {@code amount} may be null (not entered yet); null programme / state = organisation-wide / all states. */
    record Line(ContributionType book, Long programmeId, String programmeName, Long stateId, String stateName,
                BigDecimal amount, LocalDate date) {
    }

    record Grant(Long id, String code, String name, GrantStatus status, boolean active, boolean approved,
                 LocalDate startDate, LocalDate endDate, BigDecimal total) {
    }

    /** A fund profile with its donor, grant (null when none) and balance. {@code states}: id → name; empty = anywhere. */
    record Fund(Long donorId, String donorName, boolean donorActive, ContributionType book,
                Long fundId, String fundName, FundClass fundClass, Long programmeId, String programmeName,
                boolean programmeTied, Map<Long, String> states, Grant grant, BigDecimal received, BigDecimal debited) {

        BigDecimal available() {
            return received.subtract(debited);
        }
    }

    record Suggestion(Fund fund, int score, boolean coversAmount, List<String> reasons, List<String> warnings) {
    }

    record Exclusion(Fund fund, String reason) {
    }

    record Result(List<Suggestion> suggestions, List<Exclusion> excluded) {
    }

    static Result rank(Line line, List<Fund> funds) {
        List<Suggestion> eligible = new ArrayList<>();
        List<Exclusion> excluded = new ArrayList<>();
        for (Fund fund : funds) {
            String reason = exclusionOf(line, fund);
            if (reason != null) {
                excluded.add(new Exclusion(fund, reason));
            } else {
                eligible.add(score(line, fund));
            }
        }
        eligible.sort(Comparator.comparingInt(Suggestion::score).reversed()
                .thenComparing((Suggestion s) -> s.fund().available(), Comparator.reverseOrder())
                .thenComparing(s -> s.fund().fundId()));
        excluded.sort(Comparator.comparing((Exclusion e) -> e.fund().donorName(), String.CASE_INSENSITIVE_ORDER)
                .thenComparing(e -> e.fund().fundId()));
        return new Result(eligible.stream().limit(MAX_SUGGESTIONS).toList(), excluded);
    }

    /** Why this fund can't pay the note, or null when it can. */
    static String exclusionOf(Line line, Fund fund) {
        if (fund.book() != line.book()) {
            return "Booked " + fund.book().name() + " — this note is " + line.book().name();
        }
        if (!fund.donorActive()) {
            return "Donor is inactive";
        }
        Grant grant = fund.grant();
        if (grant != null) {
            if (grant.status() != GrantStatus.ACTIVE || !grant.active()) {
                return "Grant " + grant.code() + " is " + (grant.status() != null ? grant.status().getLabel().toLowerCase() : "inactive");
            }
            if (grant.startDate() != null && line.date().isBefore(grant.startDate())) {
                return "Grant " + grant.code() + " only starts on " + DATE.format(grant.startDate());
            }
            if (grant.endDate() != null && line.date().isAfter(grant.endDate())) {
                return "Grant " + grant.code() + " ended on " + DATE.format(grant.endDate());
            }
        }
        if (fund.programmeTied() && fund.programmeId() != null && !Objects.equals(fund.programmeId(), line.programmeId())) {
            return "Tied to " + fund.programmeName() + (line.programmeId() == null ? " — this is an organisation budget" : "");
        }
        if (!fund.states().isEmpty() && line.stateId() != null && !fund.states().containsKey(line.stateId())) {
            return "Can only be spent in " + String.join(", ", fund.states().values());
        }
        if (fund.available().signum() <= 0) {
            return fund.received().signum() > 0 ? "Fully used — nothing left to charge" : "Nothing received into this fund yet";
        }
        return null;
    }

    static Suggestion score(Line line, Fund fund) {
        int score = 0;
        List<String> reasons = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        boolean sameProgramme = line.programmeId() != null && Objects.equals(fund.programmeId(), line.programmeId());
        if (sameProgramme) {
            score += PROGRAMME_MATCH;
            reasons.add("Same programme");
        }

        boolean covers = line.amount() == null || fund.available().compareTo(line.amount()) >= 0;
        if (line.amount() != null) {
            if (covers) {
                score += COVERS_AMOUNT;
                reasons.add("Covers the full ₹" + INR.format(line.amount()));
            } else {
                warnings.add("Covers only ₹" + INR.format(fund.available()) + " of ₹" + INR.format(line.amount()));
            }
        }

        if (fund.fundClass() == FundClass.CLASS_A_RESTRICTED && sameProgramme) {
            score += RESTRICTED_FOR_PROGRAMME;
            reasons.add("Restricted money for this programme — use it first");
        } else if (fund.fundClass() == FundClass.CLASS_B_UNRESTRICTED || fund.fundClass() == FundClass.CLASS_C_UNRESTRICTED) {
            score += UNRESTRICTED;
        }

        Grant grant = fund.grant();
        if (grant != null) {
            score += HAS_GRANT;
            if (grant.endDate() != null) {
                long daysLeft = ChronoUnit.DAYS.between(line.date(), grant.endDate());
                if (daysLeft <= EXPIRY_WINDOW_DAYS) {
                    score += (int) Math.round(EXPIRY_MAX * (EXPIRY_WINDOW_DAYS - daysLeft) / (double) EXPIRY_WINDOW_DAYS);
                    reasons.add("Grant ends " + DATE.format(grant.endDate()) + " — use it before it lapses");
                }
            }
            if (!grant.approved()) {
                warnings.add("Grant " + grant.code() + " is not approved yet");
            }
        } else {
            warnings.add("No grant agreement — balance is from receipts only");
        }

        if (!fund.states().isEmpty() && line.stateId() == null) {
            warnings.add("Can only be spent in " + String.join(", ", fund.states().values()) + " — this budget covers all states");
        }

        return new Suggestion(fund, Math.max(0, Math.min(100, score)), covers, reasons, warnings);
    }
}
